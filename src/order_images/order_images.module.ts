import { Module } from '@nestjs/common';
import { OrderImagesService } from './order_images.service';
import { OrderImagesController } from './order_images.controller';

@Module({
  controllers: [OrderImagesController],
  providers: [OrderImagesService],
})
export class OrderImagesModule {}
