import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order_items/entities/order_item.entity';
import { TimeSlot } from '../time_slots/entities/time_slot.entity';
import { User } from '../users/entities/user.entity';
import { PricingService } from '../pricing/pricing.service';
import { GetOrdersFilterDto } from './dto/get-orders-filter.dto';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { Brackets } from 'typeorm';
import { VounchersService } from '../vounchers/vounchers.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pricingService: PricingService,
    private readonly vounchersService: VounchersService,
  ) {}

  // ===================== CREATE ORDER =====================
  async create(createOrderDto: CreateOrderDto, customerId?: number) {
    // -- 1. Validate cash policy --
    if (
      createOrderDto.payment_method === 'cash' &&
      !createOrderDto.cash_policy_accepted
    ) {
      throw new BadRequestException(
        'Bạn phải xác nhận chính sách thanh toán tiền mặt (cash_policy_accepted = true)',
      );
    }

    // -- 2. Check prepaid_required --
    if (customerId) {
      const customer = await this.userRepository.findOne({
        where: { id: customerId },
      });
      if (customer?.prepaid_required && createOrderDto.payment_method === 'cash') {
        throw new BadRequestException(
          'Tài khoản của bạn yêu cầu thanh toán online (prepaid_required)',
        );
      }
      if (customer?.is_blacklisted) {
        throw new BadRequestException(
          'Tài khoản của bạn đã bị chặn, không thể tạo đơn',
        );
      }
    }

    // -- 3. Validate time slot availability --
    const resolvedTimeSlot = createOrderDto.time_slot_id
      ? await this.resolveTimeSlot(createOrderDto.time_slot_id)
      : null;

    if (resolvedTimeSlot) {
      const timeSlot = resolvedTimeSlot.active ? resolvedTimeSlot : null;
      if (!timeSlot) {
        throw new BadRequestException('Khung giờ không tồn tại hoặc đã bị tắt');
      }

      // Count active orders in this slot on the booking date
      const activeStatuses = [
        'pending_confirmation',
        'awaiting_payment',
        'confirmed',
        // 'assigned',
        // 'in_progress',
      ];
      const currentCount = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.time_slot_id = :slotId', { slotId: timeSlot.id })
        .andWhere('order.booking_date = :date', {
          date: createOrderDto.booking_date,
        })
        .andWhere('order.status IN (:...statuses)', { statuses: activeStatuses })
        .getCount();

      if (currentCount >= timeSlot.max_orders) {
        throw new BadRequestException(
          `Khung giờ "${timeSlot.label}" đã hết chỗ cho ngày ${createOrderDto.booking_date}`,
        );
      }
    }

    const quote = await this.pricingService.quote({
      items: createOrderDto.items,
      handling_mode: createOrderDto.handling_mode,
      stairs_floors: createOrderDto.stairs_floors,
    });

    // -- 5. Apply Voucher (if any) --
    let discountAmount = 0;
    let voucherId: number | null = null;

    if (createOrderDto.voucher_code) {
      const result = await this.vounchersService.validateAndCalculate(
        createOrderDto.voucher_code,
        quote.estimated_total,
        customerId,
      );
      discountAmount = result.discountAmount;
      voucherId = result.voucher.id;
    }

    const finalEstimatedTotal = Math.max(0, quote.estimated_total - discountAmount);

    // -- 5. Determine initial status based on payment method --
    const status =
      createOrderDto.payment_method === 'online'
        ? 'awaiting_payment'
        : 'pending_confirmation';
    const paymentStatus =
      createOrderDto.payment_method === 'online'
        ? 'awaiting_payment'
        : 'unpaid';

    // -- 6. Generate unique order code --
    const orderCode = await this.generateOrderCode();

    // -- 7. Build order data with snapshots --
    const newOrderData: any = {
      order_code: orderCode,
      time_slot: resolvedTimeSlot ? { id: resolvedTimeSlot.id } : null,
      booking_date: createOrderDto.booking_date,
      payment_method: createOrderDto.payment_method,
      cash_policy_accepted: createOrderDto.cash_policy_accepted ?? false,
      handling_mode: createOrderDto.handling_mode,
      stairs_floors: createOrderDto.stairs_floors ?? null,
      notes: createOrderDto.notes ?? null,

      // Snapshot customer info at order time
      customer_name:
        createOrderDto.customer?.name ?? createOrderDto.customer_name ?? null,
      customer_phone:
        createOrderDto.customer?.phone ?? createOrderDto.customer_phone ?? null,
      customer_email:
        createOrderDto.customer?.email ?? createOrderDto.customer_email ?? null,
      pickup_address:
        this.buildPickupAddress(createOrderDto) ?? createOrderDto.pickup_address ?? null,

      // Pricing from quote engine
      handling_fee: quote.handling_fee,
      service_subtotal: quote.service_subtotal,
      estimated_total: finalEstimatedTotal,
      discount_amount: discountAmount,
      voucher: voucherId ? { id: voucherId } : null,
      manual_quote_required: quote.manual_quote_required,

      payment_status: paymentStatus,
      status,
      customer: customerId ? { id: customerId } : null,
    };

    // If customer is logged in, auto-fill snapshot from their profile
    if (customerId && !createOrderDto.customer_name) {
      const customer = await this.userRepository.findOne({
        where: { id: customerId },
      });
      if (customer) {
        newOrderData.customer_name =
          newOrderData.customer_name || customer.full_name;
        newOrderData.customer_phone =
          newOrderData.customer_phone || customer.phone;
        newOrderData.customer_email =
          newOrderData.customer_email || customer.email;
      }
    }

    const newOrder = this.orderRepository.create(
      newOrderData as DeepPartial<Order>,
    );
    const savedOrder = await this.orderRepository.save(newOrder);

    // -- 8. Save order items with snapshot data --
    const orderItems = quote.items.map(
      (item, index): DeepPartial<OrderItem> => ({
        order: savedOrder,
        service: item.service_id ? ({ id: item.service_id } as any) : null,
        service_variant: item.service_variant_id
          ? ({ id: item.service_variant_id } as any)
          : null,
        service_code_snapshot: item.service_code_snapshot,
        service_name_snapshot: item.service_name_snapshot,
        service_variant_name: item.variant_label_snapshot ?? item.custom_item_name ?? undefined,
        variant_code_snapshot: item.variant_code_snapshot ?? undefined,
        variant_label_snapshot: item.variant_label_snapshot ?? undefined,
        pricing_type: item.pricing_type,
        unit: item.unit,
        quantity: item.quantity,
        measurement_value: item.measurement_value ?? undefined,
        unit_price: item.unit_price ?? undefined,
        line_total: item.line_total ?? 0,
        custom_item_name: item.custom_item_name ?? undefined,
        custom_item_note: item.custom_item_note ?? undefined,
        manual_quote_required: item.manual_quote_required,
        display_order: index,
      }),
    );

    await this.orderItemRepository.save(
      this.orderItemRepository.create(orderItems),
    );

    // -- 9. Increment Voucher count --
    if (voucherId) {
      await this.vounchersService.incrementUsedCount(voucherId);
    }

    // -- 10. Return full order with relations --
    return await this.findOne(savedOrder.id);
  }

  // ===================== GENERATE ORDER CODE =====================
  private async generateOrderCode(): Promise<string> {
    const now = new Date();
    const datePart =
      now.getFullYear().toString().slice(-2) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    let code: string;
    let exists: boolean;
    do {
      const rand = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      code = `EC-${datePart}-${rand}`;
      const found = await this.orderRepository.findOne({
        where: { order_code: code },
      });
      exists = !!found;
    } while (exists);

    return code;
  }

  // ===================== FIND ALL =====================
  async findAll() {
    return await this.orderRepository.find({
      relations: ['customer', 'time_slot'],
    });
  }

  // ===================== FIND MY ORDERS =====================
  async findMyOrders(userId: number) {
    return await this.orderRepository.find({
      where: { customer: { id: userId } },
      relations: ['time_slot'],
      order: { created_at: 'DESC' },
    });
  }

  // ===================== FIND ONE =====================
  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'time_slot',
        'order_items',
        'order_images',
        'payments',
        'voucher',
      ],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  // ===================== CANCEL =====================
  async cancel(id: number, customerId?: number) {
    const order = await this.findOne(id);

    if (order.customer && order.customer.id !== customerId) {
      throw new ForbiddenException('You are not allowed to cancel this order');
    }

    if (
      [
        'completed',
        'cancelled',
        // 'in_progress',
      ].includes(order.status)
    ) {
      throw new BadRequestException(
        `Order cannot be cancelled because it is already ${order.status}`,
      );
    }

    order.status = 'cancelled';
    return await this.orderRepository.save(order);
  }

  // ===================== ADMIN FIND ALL =====================
  async adminFindAll(filter: GetOrdersFilterDto) {
    const {
      search,
      status,
      date,
      district,
      payment_method,
      sortBy,
      sortOrder,
    } = filter;

    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.time_slot', 'time_slot');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('order.order_code ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customer_name ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customer_phone ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customer_email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (date) {
      query.andWhere('order.booking_date = :date', { date });
    }

    if (district) {
      query.andWhere('order.pickup_address ILIKE :district', {
        district: `%${district}%`,
      });
    }

    if (payment_method) {
      query.andWhere('order.payment_method = :payment_method', {
        payment_method,
      });
    }

    query.orderBy(`order.${sortBy}`, sortOrder);

    return await query.getMany();
  }

  // ===================== ADMIN CONFIRM (FOR CASH) =====================
  async adminConfirm(id: number) {
    const order = await this.findOne(id);

    if (order.status !== 'pending_confirmation') {
      throw new BadRequestException(
        `Chỉ có thể xác nhận đơn ở trạng thái "pending_confirmation". Trạng thái hiện tại: ${order.status}`,
      );
    }

    order.status = 'confirmed';
    return await this.orderRepository.save(order);
  }

  // ===================== ADMIN CANCEL =====================
  async adminCancel(id: number) {
    const order = await this.findOne(id);

    if (['completed', 'cancelled'].includes(order.status)) {
      throw new BadRequestException(
        `Đơn hàng đã ở trạng thái ${order.status}, không thể hủy.`,
      );
    }

    order.status = 'cancelled';
    return await this.orderRepository.save(order);
  }

  // ===================== ADMIN UPDATE =====================
  async adminUpdate(id: number, dto: AdminUpdateOrderDto) {
    const order = await this.findOne(id);

    // 1. Update status with transition rules
    if (dto.status && dto.status !== order.status) {
      this.validateStatusTransition(order.status, dto.status);
      
      // If moving to no_show, use specialized method logic
      if (dto.status === 'no_show') {
         await this.handleNoShow(order);
      }
      
      order.status = dto.status;
    }

    // 2. Update payment status
    if (dto.payment_status) {
      order.payment_status = dto.payment_status;
    }

    // 3. Update internal notes
    if (dto.notes !== undefined) {
      order.notes = dto.notes;
    }

    // 4. Update final_total & adjustment_reason
    if (dto.final_total !== undefined) {
      order.final_total = dto.final_total;
      order.adjustment_reason = dto.adjustment_reason;
    }

    return await this.orderRepository.save(order);
  }

  // ===================== NO-SHOW LOGIC =====================
  private async handleNoShow(order: Order) {
    if (order.customer) {
      const customer = await this.userRepository.findOne({
        where: { id: order.customer.id },
      });
      if (customer) {
        customer.no_show_count += 1;
        // Threshold: 3 no-shows = mandatory prepaid
        if (customer.no_show_count >= 3) {
          customer.prepaid_required = true;
        }
        await this.userRepository.save(customer);
      }
    }
  }

  // ===================== STATUS TRANSITION VALIDATION =====================
  private validateStatusTransition(current: string, next: string) {
    const allowed: Record<string, string[]> = {
      draft: ['awaiting_payment', 'pending_confirmation', 'cancelled'],
      awaiting_payment: ['confirmed', 'cancelled'],
      pending_confirmation: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'no_show'],
      completed: [], // Final state
      cancelled: [], // Final state
      no_show: [],   // Final state
    };

    if (!allowed[current]?.includes(next)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ "${current}" sang "${next}".`,
      );
    }
  }

  // ===================== UPDATE =====================
  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto);
  }

  // ===================== REMOVE =====================
  remove(id: number) {
    return this.orderRepository.delete(id);
  }

  private buildPickupAddress(createOrderDto: CreateOrderDto): string | null {
    if (!createOrderDto.address) {
      return null;
    }

    const parts = [
      createOrderDto.address.street,
      createOrderDto.address.ward,
      createOrderDto.address.district,
      createOrderDto.address.province,
    ].filter((part) => Boolean(part && String(part).trim() !== ''));

    return parts.length > 0 ? parts.join(', ') : null;
  }

  private async resolveTimeSlot(identifier: string): Promise<TimeSlot | null> {
    const trimmed = String(identifier).trim();
    if (!trimmed) {
      return null;
    }

    const numericId = Number(trimmed);
    if (Number.isInteger(numericId) && numericId > 0) {
      const slotById = await this.timeSlotRepository.findOne({
        where: { id: numericId },
      });
      if (slotById) {
        return slotById;
      }
    }

    return await this.timeSlotRepository.findOne({
      where: [{ code: trimmed }, { label: trimmed }],
    });
  }
}
