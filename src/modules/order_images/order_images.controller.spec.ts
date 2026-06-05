import { Test, TestingModule } from '@nestjs/testing';
import { OrderImagesController } from './order_images.controller';
import { OrderImagesService } from './order_images.service';

describe('OrderImagesController', () => {
  let controller: OrderImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderImagesController],
      providers: [OrderImagesService],
    }).compile();

    controller = module.get<OrderImagesController>(OrderImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
