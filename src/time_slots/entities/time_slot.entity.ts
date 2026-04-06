import { Order } from '../../orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('time_slots')
export class TimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50, unique: true })
  code: string;

  @Column('text')
  label: string;

  @Column('time')
  start_time: string;

  @Column('time')
  end_time: string;

  @Column('int')
  max_orders: number;

  @Column('boolean', { default: true })
  active: boolean;

  @OneToMany(() => Order, (o) => o.time_slot)
  orders: Order[];
}
