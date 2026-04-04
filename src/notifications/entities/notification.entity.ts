import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity'; // Quan hệ với bảng orders
import { User } from '../../users/entities/user.entity'; // Quan hệ với bảng users

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column('text')
  channel: string; // 'email', 'sms', 'internal'

  @Column('varchar', { length: 50 })
  template_code: string;

  @Column('text')
  recipient: string; // Email, phone number, etc.

  @Column({ type: 'enum', enum: ['queued', 'sent', 'failed', 'cancelled'] })
  status: string;

  @Column('jsonb')
  payload: object;

  @Column({ type: 'timestamptz', nullable: true })
  sent_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}