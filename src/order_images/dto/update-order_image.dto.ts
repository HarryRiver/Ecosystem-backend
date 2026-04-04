import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderImageDto } from './create-order_image.dto';

export class UpdateOrderImageDto extends PartialType(CreateOrderImageDto) {}
