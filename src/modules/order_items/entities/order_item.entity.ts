import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity'; // Quan hệ với bảng orders
import { Service } from '../../services/entities/service.entity'; // Quan hệ với bảng services
import { ServiceVariant } from '../../service_variants/entities/service_variant.entity'; // Quan hệ với bảng service_variants

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => ServiceVariant, { nullable: true })
  @JoinColumn({ name: 'service_variant_id' })
  service_variant: ServiceVariant;

  @Column('varchar', { length: 255, nullable: true })
  service_variant_name: string;

  @Column('varchar', { length: 50 })
  service_code_snapshot: string;

  @Column('text')
  service_name_snapshot: string;

  @Column('varchar', { length: 50, nullable: true })
  variant_code_snapshot: string;

  @Column('text', { nullable: true })
  variant_label_snapshot: string;

  @Column('text')
  pricing_type: string;

  @Column('text')
  unit: string;

  @Column('int')
  quantity: number;

  @Column('numeric', { precision: 12, scale: 2, nullable: true })
  measurement_value: number;

  @Column('numeric', { precision: 12, scale: 2, nullable: true })
  unit_price: number;

  @Column('numeric', { precision: 12, scale: 2 })
  line_total: number;

  @Column('text', { nullable: true })
  custom_item_name: string;

  @Column('text', { nullable: true })
  custom_item_note: string;

  @Column('boolean', { default: false })
  manual_quote_required: boolean;

  @Column('int', { default: 0 })
  display_order: number;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
