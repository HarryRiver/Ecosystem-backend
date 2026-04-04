import { Module } from '@nestjs/common';
import { TimeSlotsService } from './time_slots.service';
import { TimeSlotsController } from './time_slots.controller';

@Module({
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
})
export class TimeSlotsModule {}
