import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TimeSlotsService } from './time_slots.service';
import { CreateTimeSlotDto } from './dto/create-time_slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time_slot.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { serializeTimeSlot } from '../../common/api-serializers';

@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  /**
   * GET /time-slots
   * Public: List only active slots
   */
  @Get()
  async findAll(@Query('date') date?: string) {
    if (date) {
      const usage = await this.timeSlotsService.getSlotUsage(date);
      return usage
        .filter((slot) => slot.active)
        .map((slot) =>
          serializeTimeSlot(slot, {
            isFull: slot.current_orders >= slot.max_orders,
          }),
        );
    }

    const slots = await this.timeSlotsService.findAll();
    return slots.map((slot) => serializeTimeSlot(slot));
  }

  /**
   * GET /time-slots/admin/list
   * Admin: List all slots including inactive
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/list')
  async findAllAdmin() {
    const slots = await this.timeSlotsService.findAllAdmin();
    return slots.map((slot) => serializeTimeSlot(slot));
  }

  /**
   * GET /time-slots/admin/usage?date=YYYY-MM-DD
   * Admin: Check how many orders are taking up each slot for a date
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/usage')
  async getSlotUsage(@Query('date') date: string) {
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    return await this.timeSlotsService.getSlotUsage(date);
  }

  /**
   * GET /time-slots/:id
   * Public: Details
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return serializeTimeSlot(await this.timeSlotsService.findOne(id));
  }

  /**
   * POST /time-slots
   * Admin: Create new slot
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return serializeTimeSlot(
      await this.timeSlotsService.create(createTimeSlotDto),
    );
  }

  /**
   * PATCH /time-slots/:id
   * Admin: Update slot
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
  ) {
    return serializeTimeSlot(
      await this.timeSlotsService.update(id, updateTimeSlotDto),
    );
  }

  /**
   * DELETE /time-slots/:id
   * Admin: Delete slot
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.timeSlotsService.remove(id);
  }
}
