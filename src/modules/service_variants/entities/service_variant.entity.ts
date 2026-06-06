import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity'; // Quan hệ với bảng services
import { OrderItem } from '../../order_items/entities/order_item.entity';

@Entity('service_variants')
export class ServiceVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service, (service) => service.variants)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column('varchar', { length: 50 })
  code: string;

  @Column('text')
  label: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  size: string;

  @Column({ type: 'enum', enum: ['item', 'bag', 'kg'], default: 'item' })
  unit: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string | null;

  @Column('numeric', { precision: 12, scale: 2 })
  price: number;

  @Column('int', { default: 0 })
  sort_order: number;

  @Column('boolean', { default: true })
  active: boolean;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.service_variant)
  orderItems: OrderItem[];
}
