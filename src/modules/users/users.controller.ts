import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from '../orders/orders.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
  ) {}

  // ===================== CUSTOMER: PROFILE =====================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    return this.usersService.me(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/orders')
  async getMyOrders(@Req() req) {
    return this.ordersService.findMyOrders(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  // ===================== ADMIN: USER MANAGEMENT =====================

  /**
   * GET /users/admin/list
   * Lọc theo status, role và tìm kiếm theo tên, sđt, email
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/list')
  async adminFindAll(@Query() filter: GetUsersFilterDto) {
    return await this.usersService.adminFindAll(filter);
  }

  /**
   * GET /users/:id
   * Admin: Xem chi tiết chi tiết user
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async adminFindOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.adminFindOne(id);
  }

  /**
   * PATCH /users/:id
   * Admin: Cập nhật thông tin profile, flag, và status
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async adminUpdateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return await this.usersService.adminUpdateUser(id, dto);
  }

  /**
   * PATCH /users/:id/toggle-lock
   * Admin: Khóa hoặc mở khóa nhanh tài khoản
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/toggle-lock')
  async adminToggleLock(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.adminToggleLock(id);
  }

  /**
   * PATCH /users/:id/toggle-prepaid
   * Admin: Bật/Tắt bắt buộc trả trước
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/toggle-prepaid')
  async adminTogglePrepaid(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.adminTogglePrepaid(id);
  }

  /**
   * PATCH /users/:id/toggle-blacklist
   * Admin: Bật/Tắt chặn tài khoản
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/toggle-blacklist')
  async adminToggleBlacklist(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.adminToggleBlacklist(id);
  }
}
