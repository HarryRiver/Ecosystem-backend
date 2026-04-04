import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';  // Quan hệ với bảng users
import { TimeSlot } from '../../time_slots/entities/time_slot.entity';  // Quan hệ với bảng time_slots
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { OrderImage } from 'src/order_images/entities/order_image.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30, unique: true })
  order_code: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => TimeSlot, { nullable: true })
  @JoinColumn({ name: 'time_slot_id' })
  time_slot: TimeSlot;

  @Column('text', { default: 'draft' })
  status: string;

  @Column({ type: 'enum', enum: ['cash', 'online'] })
  payment_method: string;

  @Column({ type: 'enum', enum: ['unpaid', 'awaiting_payment', 'paid', 'failed'] })
  payment_status: string;

  @Column('numeric', { precision: 12, scale: 2 })
  handling_fee: number;

  @Column('numeric', { precision: 12, scale: 2 })
  service_subtotal: number;

  @Column('numeric', { precision: 12, scale: 2 })
  estimated_total: number;

  @Column('numeric', { precision: 12, scale: 2, nullable: true })
  final_total: number;

  @Column('text', { nullable: true })
  adjustment_reason: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => OrderItem, (o) => o.order)
  order_items: OrderItem[];

  @OneToMany(() => OrderImage, (o) => o.order)
  order_images: OrderImage[];
  
  @OneToMany(() => Payment, (o) => o.order)
  payments: Payment[];

  
}