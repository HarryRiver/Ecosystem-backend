import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlot } from './entities/time_slot.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateTimeSlotDto } from './dto/create-time_slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time_slot.dto';

@Injectable()
export class TimeSlotsService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createTimeSlotDto: CreateTimeSlotDto) {
    const timeSlot = this.timeSlotRepository.create(createTimeSlotDto);
    return await this.timeSlotRepository.save(timeSlot);
  }

  /**
   * Public: List only active slots
   */
  async findAll() {
    return await this.timeSlotRepository.find({
      where: { active: true },
      order: { start_time: 'ASC' },
    });
  }

  /**
   * Admin: List all slots including inactive
   */
  async findAllAdmin() {
    return await this.timeSlotRepository.find({
      order: { start_time: 'ASC' },
    });
  }

  async findOne(id: number) {
    const timeSlot = await this.timeSlotRepository.findOne({ where: { id } });
    if (!timeSlot) {
      throw new NotFoundException(`TimeSlot #${id} not found`);
    }
    return timeSlot;
  }

  async update(id: number, updateTimeSlotDto: UpdateTimeSlotDto) {
    const timeSlot = await this.findOne(id);
    this.timeSlotRepository.merge(timeSlot, updateTimeSlotDto);
    return await this.timeSlotRepository.save(timeSlot);
  }

  async remove(id: number) {
    const timeSlot = await this.findOne(id);
    return await this.timeSlotRepository.remove(timeSlot);
  }

  /**
   * Admin: Get active orders count per slot for a specific date
   */
  async getSlotUsage(date: string) {
    const slots = await this.findAllAdmin();
    
    // Statuses that occupy a slot capacity
    const activeStatuses = [
      'pending_confirmation',
      'awaiting_payment',
      'confirmed',
      'completed', // Usually completed doesn't occupy future, but if they search today, it did occupy. We stick to current active if they are future. But let's count only active ones.
    ];

    const usage: any[] = [];
    
    for (const slot of slots) {
      const activeCount = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.time_slot_id = :slotId', { slotId: slot.id })
        .andWhere('order.booking_date = :date', { date })
        .andWhere('order.status IN (:...statuses)', { statuses: activeStatuses })
        .getCount();

      usage.push({
        ...slot,
        current_orders: activeCount,
        available: slot.active && activeCount < slot.max_orders,
      });
    }

    return usage;
  }
}
