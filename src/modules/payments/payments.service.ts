import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { GetPaymentsFilterDto } from './dto/get-payments-filter.dto';
import { PayOS } from '@payos/node';

@Injectable()
export class PaymentsService {
  private payos: PayOS;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService,
  ) {
    const clientId =
      this.configService.get<string>('PAYOS_CLIENT_ID') || 'placeholder';
    const apiKey =
      this.configService.get<string>('PAYOS_API_KEY') || 'placeholder';
    const checksumKey =
      this.configService.get<string>('PAYOS_CHECKSUM_KEY') || 'placeholder';

    this.payos = new PayOS({ clientId, apiKey, checksumKey });
  }

  // ===================== CREATE CHECKOUT LINK =====================
  async createCheckoutLink(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['order_items'],
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.payment_method !== 'online') {
      throw new BadRequestException(
        'This order is not configured for online payment',
      );
    }

    const orderCodeStr = order.order_code.replace(/[^0-9]/g, '').slice(-15);
    const orderCodeNumeric =
      parseInt(orderCodeStr) || Math.floor(Date.now() / 1000);

    const paymentLinkData = {
      orderCode: orderCodeNumeric,
      amount: Math.round(+order.estimated_total),
      description: `Thanh toan don hang ${order.order_code}`,
      items: order.order_items.map((item) => ({
        name: item.service_name_snapshot,
        quantity: item.quantity,
        price: Math.round(+item.unit_price || 0),
      })),
      returnUrl:
        this.configService.get<string>('PAYOS_RETURN_URL') ||
        'http://localhost:3000/payment/success',
      cancelUrl:
        this.configService.get<string>('PAYOS_CANCEL_URL') ||
        'http://localhost:3000/payment/cancel',
    };

    try {
      const paymentLink =
        await this.payos.paymentRequests.create(paymentLinkData);

      // Save a "pending" record in DB
      const newPayment = this.paymentRepository.create({
        order,
        payment_code: `PAYOS-${orderCodeNumeric}`,
        method: 'online',
        provider: 'payos',
        provider_ref: paymentLink.paymentLinkId,
        status: 'pending',
        amount: paymentLinkData.amount,
        metadata: paymentLink,
      });

      await this.paymentRepository.save(newPayment);

      return {
        checkoutUrl: paymentLink.checkoutUrl,
        paymentLinkId: paymentLink.paymentLinkId,
      };
    } catch (error) {
      console.error('PayOS Error:', error);
      throw new InternalServerErrorException(
        'Failed to create payment link with PayOS',
      );
    }
  }

  // ===================== WEBHOOK HANDLER =====================
  async handleWebhook(webhookData: any) {
    try {
      // 1. Verify data (signature)
      // Note: in 2.x verify returns a Promise<WebhookData>
      const verifiedData = await this.payos.webhooks.verify(webhookData);

      if (!verifiedData) {
        throw new BadRequestException('Invalid webhook signature');
      }

      const { orderCode } = verifiedData;
      const status =
        webhookData.data?.code === '00' ? 'PAID' : webhookData.data?.desc; // Simplified status check

      const paymentCode = `PAYOS-${orderCode}`;

      // 2. Find internal payment record
      const payment = await this.paymentRepository.findOne({
        where: { payment_code: paymentCode },
        relations: ['order'],
      });

      if (!payment) {
        console.warn(`Payment with code ${paymentCode} not found in DB`);
        return;
      }

      // 3. Update Status
      // PayOS webhook sends '00' for success
      if (webhookData.success && webhookData.data?.code === '00') {
        payment.status = 'paid';
        payment.paid_at = new Date();

        // Update Order
        if (payment.order) {
          const order = payment.order;
          order.payment_status = 'paid';
          order.status = 'confirmed'; // Auto-confirm after paid
          await this.orderRepository.save(order);
        }
      } else {
        payment.status = 'failed';
        payment.failed_at = new Date();
      }

      await this.paymentRepository.save(payment);
      return { success: true };
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw new InternalServerErrorException('Webhook handling failed');
    }
  }

  // ===================== ADMIN: LIST PAYMENTS =====================
  async adminFindAll(filter: GetPaymentsFilterDto) {
    const { search, status } = filter;
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('payment.payment_code ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('payment.provider_ref ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('order.order_code ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (status) {
      query.andWhere('payment.status = :status', { status });
    }

    query.orderBy('payment.created_at', 'DESC');

    return await query.getMany();
  }
}
