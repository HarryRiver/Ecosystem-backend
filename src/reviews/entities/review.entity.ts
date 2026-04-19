import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column('varchar', { length: 255, nullable: true })
    reviewer_name?: string;

    @Column('varchar', { length: 255, nullable: true })
    reviewer_email?: string;

    @Column('int')
    rating: number; // 1 -> 5

    @Column('text', { nullable: true })
    comment?: string;

    @Column('text', { default: 'pending' })
    status: string; // pending | approved | rejected

    @Column('boolean', { default: false })
    is_featured: boolean;

    @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
