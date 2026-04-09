import { OrderImage } from "../../order_images/entities/order_image.entity";
import { Order } from "../../orders/entities/order.entity";
import { Role } from "../../roles/entities/role.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";

@Entity("users")
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

    @Column('text', { default: 'active' })
    status: string;

    @Column({ type: 'timestamptz', nullable: true })
    last_login_at: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ type: "text", nullable: true })
    refreshToken: string | null;

    @Column('boolean', { default: false })
    prepaid_required: boolean;

    @Column('boolean', { default: false })
    is_blacklisted: boolean;

    @Column('int', { default: 0 })
    no_show_count: number;

    @Column('text', { nullable: true })
    notes: string;

    @ManyToMany(() => Role, { eager: true })
    @JoinTable({
        name: "user_roles",
        joinColumn: { name: "user_id" },
        inverseJoinColumn: { name: "role_id" },
    })
    roleSet: Role[];

    @OneToMany(() => Order, (o) => o.customer)
    orders: Order[];

    @OneToMany(() => OrderImage, (o) => o.uploaded_by_user)
    orderImages: OrderImage[];
}
