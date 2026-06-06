import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { OrderImage } from './entities/order_image.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateOrderImageDto } from './dto/create-order_image.dto';

@Injectable()
export class OrderImagesService {
  constructor(
    @InjectRepository(OrderImage)
    private readonly orderImageRepository: Repository<OrderImage>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async addImages(
    orderId: number,
    dtos: CreateOrderImageDto[],
    uploadedByUserId?: number,
  ): Promise<OrderImage[]> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    const imageEntities = dtos.map(
      (dto): DeepPartial<OrderImage> => ({
        order: { id: orderId },
        file_url: dto.file_url,
        mime_type: dto.mime_type ?? undefined,
        file_size: dto.file_size ?? undefined,
        image_role: dto.image_role,
        uploaded_by_user: uploadedByUserId
          ? { id: uploadedByUserId }
          : undefined,
      }),
    );

    const images = this.orderImageRepository.create(imageEntities);
    return await this.orderImageRepository.save(images);
  }

  async findByOrder(orderId: number): Promise<OrderImage[]> {
    return await this.orderImageRepository.find({
      where: { order: { id: orderId } },
      order: { created_at: 'DESC' },
    });
  }

  async remove(id: number) {
    const image = await this.orderImageRepository.findOne({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException(`Image #${id} not found`);
    }
    return await this.orderImageRepository.remove(image);
  }
}
