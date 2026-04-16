import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { ServicesService } from '../services/services.service';
import { ServiceVariantsService } from '../service_variants/service_variants.service';
import { TimeSlotsService } from '../time_slots/time_slots.service';
import { PaymentsService } from '../payments/payments.service';
import { VounchersService } from '../vounchers/vounchers.service';
import {
  paginate,
  serializeOrder,
  serializePayment,
  serializeService,
  serializeServiceVariant,
  serializeTimeSlot,
  serializeUser,
  serializeVoucher,
} from '../common/api-serializers';

@Controller()
export class CompatController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly dashboardService: DashboardService,
    private readonly servicesService: ServicesService,
    private readonly serviceVariantsService: ServiceVariantsService,
    private readonly timeSlotsService: TimeSlotsService,
    private readonly paymentsService: PaymentsService,
    private readonly vounchersService: VounchersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return serializeUser(await this.usersService.me(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: Record<string, any>) {
    console.log('=== PATCH /me REQUEST BODY ===', body);
    const currentUser = await this.usersService.me(req.user.userId);
    await this.usersService.updateProfile(req.user.userId, {
      full_name: body.full_name ?? body.name ?? currentUser.full_name,
      phone: body.phone ?? currentUser.phone,
      address: body.address ?? currentUser.address,
      city: body.city ?? currentUser.city,
      district: body.district ?? currentUser.district,
    });

    return serializeUser(await this.usersService.me(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/orders')
  async getMyOrders(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const orders = await this.ordersService.findMyOrders(req.user.userId);
    const filteredOrders = status
      ? orders.filter((order) => {
          const serialized = serializeOrder(order);
          return serialized?.status === status;
        })
      : orders;

    return paginate(
      filteredOrders
        .map((order) => serializeOrder(order))
        .filter(Boolean) as ReturnType<typeof serializeOrder>[],
      Number(page),
      Number(limit),
    );
  }

  @Post('orders/:id/payment-intent')
  async createPaymentIntent(@Param('id') id: string) {
    const payment = await this.paymentsService.createCheckoutLink(Number(id));

    return {
      order_id: id,
      payment_url: payment.checkoutUrl,
      expire_at: '',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/metrics')
  async getAdminMetrics() {
    const [kpi, ordersByStatus, topServices, chart] = await Promise.all([
      this.dashboardService.getKpi(),
      this.dashboardService.getOrdersByStatus(),
      this.dashboardService.getTopServices(),
      this.dashboardService.getOrdersChart('week'),
    ]);

    return {
      total_orders: kpi.total_orders,
      today_orders: kpi.today_orders,
      total_revenue: kpi.revenue,
      completion_rate: kpi.completion_rate,
      orders_by_status: ordersByStatus,
      revenue_chart: chart.map((point) => ({
        date: point.date,
        revenue: 0,
      })),
      top_services: topServices.map((service) => ({
        ...service,
        revenue: 0,
      })),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/orders')
  async getAdminOrders(@Query() query: Record<string, any>) {
    const orders = await this.ordersService.adminFindAll({
      search: query.search,
      status: query.status,
      date: query.date ?? query.date_from,
      district: query.district,
      payment_method: query.payment_method,
      sortBy: query.sortBy ?? 'created_at',
      sortOrder: query.sortOrder ?? 'DESC',
    });

    return paginate(
      orders.map((order) => serializeOrder(order)).filter(Boolean) as ReturnType<
        typeof serializeOrder
      >[],
      Number(query.page),
      Number(query.limit),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/orders/:id')
  async getAdminOrderById(@Param('id') id: string) {
    return serializeOrder(await this.ordersService.findOne(Number(id)));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/orders/:id')
  async updateAdminOrder(@Param('id') id: string, @Body() body: Record<string, any>) {
    return serializeOrder(
      await this.ordersService.adminUpdate(Number(id), {
        status: body.status,
        final_total: body.final_total,
        adjustment_reason: body.adjustment_reason,
        notes: body.internal_notes ?? body.notes,
      }),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/orders/:id/mark-no-show')
  async markAdminOrderNoShow(@Param('id') id: string) {
    return serializeOrder(
      await this.ordersService.adminUpdate(Number(id), {
        status: 'no_show',
      }),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/services')
  async getAdminServices(@Query() query: Record<string, any>) {
    const services = await this.servicesService.findAllAdmin();
    return paginate(
      services.map((service) => serializeService(service)).filter(Boolean) as ReturnType<
        typeof serializeService
      >[],
      Number(query.page),
      Number(query.limit),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/services')
  async createAdminService(@Body() body: Record<string, any>) {
    return serializeService(
      await this.servicesService.create({
        code: body.code ?? this.slugify(body.name ?? 'service'),
        name: body.name,
        category: ['furniture', 'electronics', 'other'].includes(body.category)
          ? body.category
          : 'other',
        pricing_type: this.toBackendPricingType(body.pricing_type),
        base_price: body.base_price,
        default_unit: body.default_unit ?? 'item',
        active: body.active ?? true,
      } as any),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/services/:id')
  async updateAdminService(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    return serializeService(
      await this.servicesService.update(Number(id), {
        ...body,
        pricing_type: body.pricing_type
          ? this.toBackendPricingType(body.pricing_type)
          : undefined,
      } as any),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('admin/services/:id')
  async deleteAdminService(@Param('id') id: string) {
    await this.servicesService.remove(Number(id));
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/services/:serviceId/variants')
  async getAdminServiceVariants(@Param('serviceId') serviceId: string) {
    const variants = await this.serviceVariantsService.findByService(Number(serviceId));
    return variants
      .map((variant) => serializeServiceVariant(variant))
      .filter(Boolean);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/services/:serviceId/variants')
  async createAdminServiceVariant(
    @Param('serviceId') serviceId: string,
    @Body() body: Record<string, any>,
  ) {
    return serializeServiceVariant(
      await this.serviceVariantsService.create({
        service_id: Number(serviceId),
        code: body.code ?? this.slugify(body.label ?? 'variant'),
        label: body.label,
        price: body.price,
        unit: body.unit ?? 'item',
      } as any),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/service-variants/:id')
  async updateAdminServiceVariant(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    return serializeServiceVariant(
      await this.serviceVariantsService.update(Number(id), body as any),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('admin/service-variants/:id')
  async deleteAdminServiceVariant(@Param('id') id: string) {
    await this.serviceVariantsService.remove(Number(id));
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/time-slots')
  async getAdminTimeSlots() {
    const slots = await this.timeSlotsService.findAllAdmin();
    return slots.map((slot) => serializeTimeSlot(slot)).filter(Boolean);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/time-slots')
  async createAdminTimeSlot(@Body() body: Record<string, any>) {
    return serializeTimeSlot(
      await this.timeSlotsService.create({
        code: body.code ?? this.buildTimeSlotCode(body.start_time, body.end_time),
        label:
          body.label ?? this.buildTimeSlotLabel(body.start_time, body.end_time),
        start_time: body.start_time,
        end_time: body.end_time,
        max_orders: body.max_orders,
        active: body.active ?? true,
      } as any),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/time-slots/:id')
  async updateAdminTimeSlot(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    const start = body.start_time;
    const end = body.end_time;

    return serializeTimeSlot(
      await this.timeSlotsService.update(Number(id), {
        ...body,
        ...(start && end
          ? {
              label: body.label ?? this.buildTimeSlotLabel(start, end),
            }
          : {}),
      } as any),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/users')
  async getAdminUsers(@Query() query: Record<string, any>) {
    const users = await this.usersService.adminFindAll({
      search: query.search,
      status: query.status,
      role: query.role,
    } as any);

    return paginate(
      users.map((user) => serializeUser(user)).filter(Boolean) as ReturnType<
        typeof serializeUser
      >[],
      Number(query.page),
      Number(query.limit),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/users/:id')
  async getAdminUserById(@Param('id') id: string) {
    return serializeUser(await this.usersService.adminFindOne(Number(id)));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/users/:id')
  async updateAdminUser(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    return serializeUser(
      await this.usersService.adminUpdateUser(Number(id), body as any),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/payments')
  async getAdminPayments(@Query() query: Record<string, any>) {
    const payments = await this.paymentsService.adminFindAll({
      search: query.search ?? query.provider_ref,
      status: query.status,
    } as any);

    return paginate(
      payments.map((payment) => serializePayment(payment)).filter(Boolean) as ReturnType<
        typeof serializePayment
      >[],
      Number(query.page),
      Number(query.limit),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/vouchers')
  async getAdminVouchers() {
    const vouchers = await this.vounchersService.findAll();
    return vouchers.map((voucher) => serializeVoucher(voucher)).filter(Boolean);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/vouchers')
  async createAdminVoucher(@Body() body: Record<string, any>) {
    return serializeVoucher(await this.vounchersService.create(body as any));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/vouchers/:id')
  async updateAdminVoucher(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    return serializeVoucher(
      await this.vounchersService.update(Number(id), body as any),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/notifications')
  getNotifications() {
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/notifications/unread-count')
  getUnreadNotifications() {
    return { count: 0 };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/notifications/:id/read')
  markNotificationRead() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/notifications/read-all')
  markAllNotificationsRead() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/notifications')
  getAdminNotifications() {
    return [];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/notifications/unread-count')
  getAdminUnreadNotifications() {
    return { count: 0 };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/notifications/:id/read')
  markAdminNotificationRead() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/notifications/send')
  sendAdminNotification() {
    return { ok: true };
  }

  private toBackendPricingType(value: unknown): 'fixed' | 'weight_based' | 'quote_only' {
    const normalized = String(value ?? '').trim().toLowerCase();

    if (normalized === 'per_kg') {
      return 'weight_based';
    }

    if (normalized === 'quote') {
      return 'quote_only';
    }

    return 'fixed';
  }

  private slugify(value: string): string {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  }

  private buildTimeSlotLabel(start: string, end: string): string {
    return `${start} - ${end}`;
  }

  private buildTimeSlotCode(start: string, end: string): string {
    return `${start}_${end}`.replace(/[^0-9a-zA-Z]+/g, '_');
  }
}
