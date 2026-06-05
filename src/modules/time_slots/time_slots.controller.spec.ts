import { Test, TestingModule } from '@nestjs/testing';
import { TimeSlotsController } from './time_slots.controller';
import { TimeSlotsService } from './time_slots.service';

describe('TimeSlotsController', () => {
  let controller: TimeSlotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeSlotsController],
      providers: [TimeSlotsService],
    }).compile();

    controller = module.get<TimeSlotsController>(TimeSlotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
