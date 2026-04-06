import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';  // Quan hệ với bảng users
import { TimeSlot } from '../../time_slots/entities/time_slot.entity';  // Quan hệ với bảng time_slots
import { OrderItem } from '../../order_items/entities/order_item.entity';
import { OrderImage } from '../../order_images/entities/order_image.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Vouncher } from '../../vounchers/entities/vouncher.entity';

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

  // Guest checkout / Contact information
  @Column('varchar', { length: 255, nullable: true })
  customer_name?: string;

  @Column('varchar', { length: 20, nullable: true })
  customer_phone?: string;

  @Column('varchar', { length: 255, nullable: true })
  customer_email?: string;

  @Column('text', { nullable: true })
  pickup_address?: string;

  @Column('date', { nullable: true })
  booking_date?: string;

  @Column('text', { default: 'draft' })
  status: string;

  @Column({ type: 'enum', enum: ['cash', 'online'] })
  payment_method: string;

  @Column({ type: 'enum', enum: ['unpaid', 'awaiting_payment', 'paid', 'failed'] })
  payment_status: string;

  @Column('text', { default: 'inside' })
  handling_mode: string;

  @Column('int', { nullable: true })
  stairs_floors?: number;

  @Column('numeric', { precision: 12, scale: 2 })
  handling_fee: number;

  @Column('numeric', { precision: 12, scale: 2 })
  service_subtotal: number;

  @Column('numeric', { precision: 12, scale: 2 })
  estimated_total: number;

  @Column('numeric', { precision: 12, scale: 2, nullable: true })
  final_total?: number;

  @ManyToOne(() => Vouncher, { nullable: true })
  @JoinColumn({ name: 'voucher_id' })
  voucher?: Vouncher;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  discount_amount: number;

  @Column('text', { nullable: true })
  adjustment_reason?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('boolean', { default: false })
  manual_quote_required: boolean;

  @Column('boolean', { default: false })
  cash_policy_accepted: boolean;

  /*
  // Staff flow is disabled in the current project scope.
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_staff_user_id' })
  assigned_staff: User;
  */

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
