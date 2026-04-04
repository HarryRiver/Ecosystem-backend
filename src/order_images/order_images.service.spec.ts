import { Test, TestingModule } from '@nestjs/testing';
import { OrderImagesService } from './order_images.service';

describe('OrderImagesService', () => {
  let service: OrderImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderImagesService],
    }).compile();

    service = module.get<OrderImagesService>(OrderImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
