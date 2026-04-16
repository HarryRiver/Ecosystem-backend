import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetOrdersFilterDto } from './dto/get-orders-filter.dto';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { serializeOrder } from '../common/api-serializers';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const customerId = req.user ? req.user.userId : undefined;
    return serializeOrder(await this.ordersService.create(createOrderDto, customerId));
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/list')
  adminFindAll(@Query() filter: GetOrdersFilterDto) {
    return this.ordersService.adminFindAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return serializeOrder(await this.ordersService.findOne(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/confirm')
  confirm(@Param('id') id: number) {
    return this.ordersService.adminConfirm(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/admin-cancel')
  adminCancel(@Param('id') id: number) {
    return this.ordersService.adminCancel(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/admin')
  adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateOrderDto,
  ) {
    return this.ordersService.adminUpdate(id, dto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post(':id/cancel')
  async cancel(@Param('id') id: number, @Req() req: any) {
    const customerId = req.user ? req.user.userId : undefined;
    return serializeOrder(await this.ordersService.cancel(id, customerId));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ordersService.remove(id);
  }
}
