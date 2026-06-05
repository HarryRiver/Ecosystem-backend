import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // --- /me/notifications ---
  @Get('me/notifications')
  getUserNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getUserNotifications(user.userId);
  }

  @Get('me/notifications/unread-count')
  countUnreadUser(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.countUnreadUser(user.userId);
  }

  @Patch('me/notifications/:id/read')
  markUserAsRead(
    @Param('id') id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.markAsReadUser(user.userId, id);
  }

  @Post('me/notifications/read-all')
  markAllUserAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsReadUser(user.userId);
  }

  // --- /admin/notifications ---
  @Get('admin/notifications')
  @Roles('admin', 'admin1', 'admin2')
  getAdminNotifications() {
    return this.notificationsService.getAdminNotifications();
  }

  @Get('admin/notifications/unread-count')
  @Roles('admin', 'admin1', 'admin2')
  countUnreadAdmin() {
    return this.notificationsService.countUnreadAdmin();
  }

  @Patch('admin/notifications/:id/read')
  @Roles('admin', 'admin1', 'admin2')
  markAdminAsRead(@Param('id') id: number) {
    return this.notificationsService.markAsReadAdmin(id);
  }

  @Post('admin/notifications/send')
  @Roles('admin', 'admin1', 'admin2')
  sendAdminNotification(@Body() payload: any) {
    return this.notificationsService.sendAdmin(payload);
  }
}
