import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity'; // Quan hệ với bảng orders
import { User } from '../../users/entities/user.entity'; // Quan hệ với bảng users

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @Column('text')
  channel: string; // 'email', 'sms', 'internal'

  @Column('varchar', { length: 50, nullable: true })
  template_code: string;

  @Column('text', { nullable: true })
  recipient: string; // Email, phone number, etc.

  @Column({
    type: 'enum',
    enum: ['queued', 'sent', 'failed', 'cancelled'],
    default: 'queued',
  })
  status: string;

  @Column('jsonb', { nullable: true })
  payload: object;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  read_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  sent_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
