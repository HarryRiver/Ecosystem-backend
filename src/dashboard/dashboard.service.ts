import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order_items/entities/order_item.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  // ===================== KPI TỔNG QUAN =====================
  async getKpi() {
    const today = new Date().toISOString().split('T')[0];

    // 1. Tổng đơn
    const totalOrders = await this.orderRepository.count();

    // 2. Đơn hôm nay
    const todayOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('DATE(order.created_at) = :today', { today })
      .getCount();

    // 3. Doanh thu (tổng final_total hoặc estimated_total nếu chưa chốt)
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select(
        'COALESCE(SUM(COALESCE(order.final_total, order.estimated_total)), 0)',
        'revenue',
      )
      .where('order.status IN (:...statuses)', {
        statuses: ['completed'],
      })
      .getRawOne();
    const revenue = parseFloat(revenueResult?.revenue || '0');

    // 4. Tỷ lệ hoàn thành
    const completedOrders = await this.orderRepository.count({
      where: { status: 'completed' },
    });
    const completionRate =
      totalOrders > 0
        ? Math.round((completedOrders / totalOrders) * 10000) / 100
        : 0;

    // 5. Tỷ lệ no-show
    const noShowOrders = await this.orderRepository.count({
      where: { status: 'no_show' },
    });
    const noShowRate =
      totalOrders > 0
        ? Math.round((noShowOrders / totalOrders) * 10000) / 100
        : 0;

    return {
      total_orders: totalOrders,
      today_orders: todayOrders,
      revenue,
      completion_rate: completionRate,
      no_show_rate: noShowRate,
    };
  }

  // ===================== SỐ ĐƠN THEO TRẠNG THÁI =====================
  async getOrdersByStatus() {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    return result.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));
  }

  // ===================== ĐƠN CHỜ XÁC NHẬN CASH =====================
  async getPendingCashCount() {
    const count = await this.orderRepository.count({
      where: {
        status: 'pending_confirmation',
        payment_method: 'cash',
      },
    });
    return { pending_cash_confirmation: count };
  }

  // ===================== TOP DỊCH VỤ =====================
  async getTopServices(limit = 10) {
    const result = await this.orderItemRepository
      .createQueryBuilder('item')
      .select('item.service_name_snapshot', 'service_name')
      .addSelect('SUM(item.quantity)', 'total_quantity')
      .addSelect('COUNT(DISTINCT item.order)', 'order_count')
      .groupBy('item.service_name_snapshot')
      .orderBy('total_quantity', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((r) => ({
      service_name: r.service_name,
      total_quantity: parseInt(r.total_quantity, 10),
      order_count: parseInt(r.order_count, 10),
    }));
  }

  // ===================== BIỂU ĐỒ ĐƠN THEO NGÀY (RANGE) =====================
  async getOrdersChart(range: 'week' | 'month' = 'week') {
    const days = range === 'month' ? 30 : 7;

    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('order.created_at >= NOW() - INTERVAL :days DAY', {
        days: `${days}`,
      })
      .groupBy('DATE(order.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));
  }

  // ===================== TỔNG HỢP DASHBOARD =====================
  async getDashboard() {
    const [kpi, ordersByStatus, pendingCash, topServices, chartWeek] =
      await Promise.all([
        this.getKpi(),
        this.getOrdersByStatus(),
        this.getPendingCashCount(),
        this.getTopServices(),
        this.getOrdersChart('week'),
      ]);

    return {
      kpi,
      orders_by_status: ordersByStatus,
      ...pendingCash,
      top_services: topServices,
      orders_chart: chartWeek,
    };
  }
}
