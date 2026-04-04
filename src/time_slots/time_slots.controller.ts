import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TimeSlotsService } from './time_slots.service';
import { CreateTimeSlotDto } from './dto/create-time_slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time_slot.dto';

@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Post()
  create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.timeSlotsService.create(createTimeSlotDto);
  }

  @Get()
  findAll() {
    return this.timeSlotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timeSlotsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimeSlotDto: UpdateTimeSlotDto) {
    return this.timeSlotsService.update(+id, updateTimeSlotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timeSlotsService.remove(+id);
  }
}
