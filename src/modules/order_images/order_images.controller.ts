import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderImagesService } from './order_images.service';
import { CreateOrderImageDto } from './dto/create-order_image.dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('orders')
export class OrderImagesController {
  constructor(private readonly orderImagesService: OrderImagesService) {}

  /**
   * POST /orders/:id/images
   * Body: { images: [{ file_url, image_role, mime_type?, file_size? }] }
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Post(':id/images')
  async addImages(
    @Param('id', ParseIntPipe) id: number,
    @Body('images') images: CreateOrderImageDto[],
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return await this.orderImagesService.addImages(id, images, userId);
  }

  /**
   * GET /orders/:id/images
   */
  @Get(':id/images')
  async findByOrder(@Param('id', ParseIntPipe) id: number) {
    return await this.orderImagesService.findByOrder(id);
  }

  /**
   * DELETE /orders/images/:imageId
   */
  @Delete('images/:imageId')
  async remove(@Param('imageId', ParseIntPipe) imageId: number) {
    return await this.orderImagesService.remove(imageId);
  }
}
