import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order_items/entities/order_item.entity';
import { PricingModule } from '../pricing/pricing.module';
import { TimeSlot } from '../time_slots/entities/time_slot.entity';
import { User } from '../users/entities/user.entity';
import { VounchersModule } from '../vounchers/vounchers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, TimeSlot, User]),
    PricingModule,
    VounchersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
