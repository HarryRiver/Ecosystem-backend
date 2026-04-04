import { Test, TestingModule } from '@nestjs/testing';
import { OtpsController } from './otps.controller';
import { OtpsService } from './otps.service';

describe('OtpsController', () => {
  let controller: OtpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpsController],
      providers: [OtpsService],
    }).compile();

    controller = module.get<OtpsController>(OtpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
