import { Injectable } from '@nestjs/common';
import { CreateServiceVariantDto } from './dto/create-service_variant.dto';
import { UpdateServiceVariantDto } from './dto/update-service_variant.dto';

@Injectable()
export class ServiceVariantsService {
  create(createServiceVariantDto: CreateServiceVariantDto) {
    return 'This action adds a new serviceVariant';
  }

  findAll() {
    return `This action returns all serviceVariants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceVariant`;
  }

  update(id: number, updateServiceVariantDto: UpdateServiceVariantDto) {
    return `This action updates a #${id} serviceVariant`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceVariant`;
  }
}
