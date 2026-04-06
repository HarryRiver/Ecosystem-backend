import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';  // Quan hệ với bảng orders
import { User } from '../../users/entities/user.entity';  // Quan hệ với bảng users

@Entity('order_images')
export class OrderImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column('text')
  file_url: string;

  @Column('varchar', { length: 100, nullable: true })
  mime_type: string;

  @Column('int', { nullable: true })
  file_size: number;

  @Column('text')
  image_role: string; // customer_upload | completion_proof

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploaded_by_user: User;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
