import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';  // Quan hệ với bảng orders

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column('varchar', { length: 40, unique: true })
  payment_code: string;

  @Column({ type: 'enum', enum: ['cash', 'online'] })
  method: string;

  @Column('varchar', { length: 100, nullable: true })
  provider: string;

  @Column('varchar', { length: 100, nullable: true })
  provider_ref: string;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'] })
  status: string;

  @Column('numeric', { precision: 12, scale: 2 })
  amount: number;

  @Column('timestamptz', { nullable: true })
  paid_at: Date;

  @Column('timestamptz', { nullable: true })
  failed_at: Date;

  @Column('jsonb', { nullable: true })
  metadata: object;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}