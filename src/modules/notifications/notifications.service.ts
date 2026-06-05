import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // --- USER METHODS ---
  async getUserNotifications(userId: number) {
    return this.notificationRepository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async countUnreadUser(userId: number) {
    const count = await this.notificationRepository.count({
      where: { userId, is_read: false },
    });
    return { count };
  }

  async markAsReadUser(userId: number, notificationId: number) {
    const notif = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.is_read = true;
    notif.read_at = new Date();
    return this.notificationRepository.save(notif);
  }

  async markAllAsReadUser(userId: number) {
    await this.notificationRepository.update(
      { userId, is_read: false },
      { is_read: true, read_at: new Date() },
    );
    return { success: true, message: 'All notifications marked as read' };
  }

  // --- ADMIN METHODS ---
  async getAdminNotifications() {
    return this.notificationRepository.find({
      where: { userId: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async countUnreadAdmin() {
    const count = await this.notificationRepository.count({
      where: { userId: IsNull(), is_read: false },
    });
    return { count };
  }

  async markAsReadAdmin(notificationId: number) {
    const notif = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.is_read = true;
    notif.read_at = new Date();
    return this.notificationRepository.save(notif);
  }

  async sendAdmin(payload: any) {
    const obj = {
      ...payload,
      status: 'queued',
      userId: payload.user_id || payload.userId || null,
    };
    const newNotif = this.notificationRepository.create(obj as any);
    const saved = (await this.notificationRepository.save(newNotif)) as unknown as Notification;

    // Emit event to websockets
    if (saved.userId) {
      this.notificationsGateway.emitToUser(saved.userId, 'new_notification', saved);
    } else {
      this.notificationsGateway.emitToAll('new_notification', saved);
    }

    return saved;
  }
}
