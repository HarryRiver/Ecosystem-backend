import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { ServiceVariant } from "../../service_variants/entities/service_variant.entity";
import { OrderItem } from "../../order_items/entities/order_item.entity";

@Entity("services")
export class Service {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column('varchar', { length: 50, unique: true })
    code: string;

    @Column({ 
      type: 'enum', 
      enum: ['furniture', 'electronics', 'metals', 'plastics', 'paper', 'clothes', 'vehicles', 'other'] 
    })
    category: string;

    @Column('text')
    name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column('text', { nullable: true })
    icon: string;

    @Column({ type: 'enum', enum: ['fixed', 'weight_based', 'quote_only'] })
    pricing_type: string;

    @Column({ type: 'enum', enum: ['item', 'bag', 'kg'], default: 'item' })
    default_unit: string;

    @Column('numeric', { precision: 12, scale: 2, nullable: true })
    base_price: number;

    @Column('boolean', { default: false })
    manual_quote_required: boolean;

    @Column('boolean', { default: true })
    requires_image: boolean;

    @Column('boolean', { default: false })
    requires_custom_name: boolean;

    @Column('boolean', { default: true })
    active: boolean;

    @Column('int', { default: 0 })
    sort_order: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @OneToMany(() => ServiceVariant, variant => variant.service)
    variants: ServiceVariant[];

    @OneToMany(() => OrderItem, orderItem => orderItem.service)
    orderItems: OrderItem[];
}
