import { Test, TestingModule } from '@nestjs/testing';
import { ServiceVariantsController } from './service_variants.controller';
import { ServiceVariantsService } from './service_variants.service';

describe('ServiceVariantsController', () => {
  let controller: ServiceVariantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceVariantsController],
      providers: [ServiceVariantsService],
    }).compile();

    controller = module.get<ServiceVariantsController>(
      ServiceVariantsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
