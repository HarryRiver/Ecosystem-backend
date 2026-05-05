import { Test, TestingModule } from '@nestjs/testing';
import { VounchersController } from './vounchers.controller';
import { VounchersService } from './vounchers.service';

describe('VounchersController', () => {
  let controller: VounchersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VounchersController],
      providers: [VounchersService],
    }).compile();

    controller = module.get<VounchersController>(VounchersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
