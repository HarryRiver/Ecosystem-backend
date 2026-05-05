import { Test, TestingModule } from '@nestjs/testing';
import { VounchersService } from './vounchers.service';

describe('VounchersService', () => {
  let service: VounchersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VounchersService],
    }).compile();

    service = module.get<VounchersService>(VounchersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
