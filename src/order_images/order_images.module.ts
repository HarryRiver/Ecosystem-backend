import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderImagesService } from './order_images.service';
import { OrderImagesController } from './order_images.controller';
import { OrderImage } from './entities/order_image.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderImage, Order])],
  controllers: [OrderImagesController],
  providers: [OrderImagesService],
})
export class OrderImagesModule {}
