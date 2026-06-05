import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('vouchers') // Base table name is vouchers for standard DB naming
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50, unique: true })
  code: string;

  @Column({ type: 'enum', enum: ['percent', 'fixed'], default: 'fixed' })
  type: string;

  @Column('numeric', { precision: 12, scale: 2 })
  value: number;

  @Column('numeric', { precision: 12, scale: 2, nullable: true })
  max_discount?: number;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  min_order_value: number;

  @Column('int', { default: 0 })
  usage_limit: number;

  @Column('int', { default: 0 })
  used_count: number;

  @Column('int', { default: 1 })
  per_user_limit: number;

  @Column('timestamptz', { nullable: true })
  start_date?: Date;

  @Column('timestamptz', { nullable: true })
  end_date?: Date;

  @Column('boolean', { default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => Order, (order) => order.voucher)
  orders: Order[];
}
