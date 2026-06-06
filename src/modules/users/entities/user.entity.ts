import { Review } from '../../reviews/entities/review.entity';
import { OrderImage } from '../../order_images/entities/order_image.entity';
import { Order } from '../../orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column('text')
  full_name: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  district: string;

  @Column('text', { default: 'active' }) // 'unverified' | 'active' | 'locked'
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column('boolean', { default: false })
  prepaid_required: boolean;

  @Column('boolean', { default: false })
  is_blacklisted: boolean;

  @Column('int', { default: 0 })
  no_show_count: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { default: 'customer' })
  role: string;

  @OneToMany(() => Order, (o) => o.customer)
  orders: Order[];

  @OneToMany(() => OrderImage, (o) => o.uploaded_by_user)
  orderImages: OrderImage[];

  @OneToMany(() => Review, (r) => r.user)
  reviews: Review[];
}
