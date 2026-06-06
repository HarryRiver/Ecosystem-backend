import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Voucher } from './entities/voucher.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // ===================== ADMIN CRUD =====================

  async create(createVoucherDto: CreateVoucherDto) {
    const existing = await this.voucherRepository.findOne({
      where: { code: createVoucherDto.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException('Voucher code already exists');
    }
    const voucher = this.voucherRepository.create({
      ...createVoucherDto,
      code: createVoucherDto.code.toUpperCase(),
    });
    return await this.voucherRepository.save(voucher);
  }

  async findAll() {
    return await this.voucherRepository.find({ order: { created_at: 'DESC' } });
  }

  async findPublicActive() {
    const now = new Date();

    return await this.voucherRepository
      .createQueryBuilder('voucher')
      .where('voucher.active = :active', { active: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where('voucher.start_date IS NULL').orWhere(
            'voucher.start_date <= :now',
            { now },
          );
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('voucher.end_date IS NULL').orWhere(
            'voucher.end_date >= :now',
            { now },
          );
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('voucher.usage_limit = 0').orWhere(
            'voucher.used_count < voucher.usage_limit',
          );
        }),
      )
      .orderBy('voucher.created_at', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    const voucher = await this.voucherRepository.findOne({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher not found');
    return voucher;
  }

  async update(id: number, updateVoucherDto: UpdateVoucherDto) {
    const voucher = await this.findOne(id);
    if (updateVoucherDto.code) {
      updateVoucherDto.code = updateVoucherDto.code.toUpperCase();
    }
    this.voucherRepository.merge(voucher, updateVoucherDto);
    return await this.voucherRepository.save(voucher);
  }

  async remove(id: number) {
    const voucher = await this.findOne(id);
    return await this.voucherRepository.remove(voucher);
  }

  // ===================== CORE LOGIC: VALIDATE & CALCULATE =====================

  async validateAndCalculate(
    code: string,
    amount: number,
    customerId?: number,
  ) {
    const voucher = await this.voucherRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) throw new NotFoundException('Mã giảm giá không hợp lệ');
    if (!voucher.active)
      throw new BadRequestException('Mã giảm giá đã bị vô hiệu hóa');

    const now = new Date();
    if (voucher.start_date && now < voucher.start_date) {
      throw new BadRequestException('Mã giảm giá chưa đến ngày sử dụng');
    }
    if (voucher.end_date && now > voucher.end_date) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }

    if (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    if (amount < voucher.min_order_value) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${voucher.min_order_value.toLocaleString()}₫ để áp dụng mã này`,
      );
    }

    // Check per user limit (only if registered user)
    if (customerId) {
      const userUsageCount = await this.orderRepository.count({
        where: {
          customer: { id: customerId },
          voucher: { id: voucher.id },
          // Only count successful/confirmed orders? Usually yes.
          // For now count all for simplicity
        },
      });

      if (userUsageCount >= voucher.per_user_limit) {
        throw new BadRequestException(
          `Bạn đã sử dụng mã này ${userUsageCount} lần. Giới hạn là ${voucher.per_user_limit} lần.`,
        );
      }
    }

    // Calculate discount
    let discount = 0;
    if (voucher.type === 'percent') {
      discount = amount * (voucher.value / 100);
      if (voucher.max_discount && discount > voucher.max_discount) {
        discount = voucher.max_discount;
      }
    } else {
      discount = voucher.value;
    }

    // Never discount more than the order total?
    if (discount > amount) discount = amount;

    return {
      voucher,
      discountAmount: Math.round(discount),
    };
  }

  async incrementUsedCount(id: number) {
    return await this.voucherRepository.increment({ id }, 'used_count', 1);
  }
}
