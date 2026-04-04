import { Injectable } from '@nestjs/common';
import { CreateOrderImageDto } from './dto/create-order_image.dto';
import { UpdateOrderImageDto } from './dto/update-order_image.dto';

@Injectable()
export class OrderImagesService {
  create(createOrderImageDto: CreateOrderImageDto) {
    return 'This action adds a new orderImage';
  }

  findAll() {
    return `This action returns all orderImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderImage`;
  }

  update(id: number, updateOrderImageDto: UpdateOrderImageDto) {
    return `This action updates a #${id} orderImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderImage`;
  }
}
