import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderImagesService } from './order_images.service';
import { CreateOrderImageDto } from './dto/create-order_image.dto';
import { UpdateOrderImageDto } from './dto/update-order_image.dto';

@Controller('order-images')
export class OrderImagesController {
  constructor(private readonly orderImagesService: OrderImagesService) {}

  @Post()
  create(@Body() createOrderImageDto: CreateOrderImageDto) {
    return this.orderImagesService.create(createOrderImageDto);
  }

  @Get()
  findAll() {
    return this.orderImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderImagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderImageDto: UpdateOrderImageDto) {
    return this.orderImagesService.update(+id, updateOrderImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderImagesService.remove(+id);
  }
}
