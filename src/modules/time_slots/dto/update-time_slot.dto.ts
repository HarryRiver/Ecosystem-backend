import { PartialType } from '@nestjs/mapped-types';
import { CreateTimeSlotDto } from './create-time_slot.dto';

export class UpdateTimeSlotDto extends PartialType(CreateTimeSlotDto) {}
