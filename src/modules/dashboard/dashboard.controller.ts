import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /admin/dashboard
   * Trả về toàn bộ dữ liệu dashboard trong 1 request
   */
  @Get()
  async getDashboard() {
    return await this.dashboardService.getDashboard();
  }

  /**
   * GET /admin/dashboard/kpi
   * Chỉ lấy KPI chính
   */
  @Get('kpi')
  async getKpi() {
    return await this.dashboardService.getKpi();
  }

  /**
   * GET /admin/dashboard/orders-by-status
   * Số đơn theo từng trạng thái
   */
  @Get('orders-by-status')
  async getOrdersByStatus() {
    return await this.dashboardService.getOrdersByStatus();
  }

  /**
   * GET /admin/dashboard/pending-cash
   * Số đơn cash chờ xác nhận
   */
  @Get('pending-cash')
  async getPendingCash() {
    return await this.dashboardService.getPendingCashCount();
  }

  /**
   * GET /admin/dashboard/top-services
   * Top dịch vụ được đặt nhiều nhất
   */
  @Get('top-services')
  async getTopServices() {
    return await this.dashboardService.getTopServices();
  }

  /**
   * GET /admin/dashboard/chart?range=week|month
   * Biểu đồ số đơn theo ngày
   */
  @Get('chart')
  async getChart(@Query('range') range: 'week' | 'month') {
    return await this.dashboardService.getOrdersChart(range || 'week');
  }
}
