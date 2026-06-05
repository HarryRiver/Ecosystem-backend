import { Test, TestingModule } from '@nestjs/testing';
import { ServiceVariantsService } from './service_variants.service';

describe('ServiceVariantsService', () => {
  let service: ServiceVariantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceVariantsService],
    }).compile();

    service = module.get<ServiceVariantsService>(ServiceVariantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
