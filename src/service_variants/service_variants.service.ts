import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceVariant } from './entities/service_variant.entity';
import { CreateServiceVariantDto } from './dto/create-service_variant.dto';
import { UpdateServiceVariantDto } from './dto/update-service_variant.dto';

@Injectable()
export class ServiceVariantsService {
  constructor(
    @InjectRepository(ServiceVariant)
    private readonly variantRepository: Repository<ServiceVariant>,
  ) {}

  async create(dto: CreateServiceVariantDto) {
    const variant = this.variantRepository.create({
      ...dto,
      service: { id: dto.service_id },
    });
    return await this.variantRepository.save(variant);
  }

  async findByService(serviceId: number) {
    return await this.variantRepository.find({
      where: { service: { id: serviceId } },
      order: { sort_order: 'ASC' },
      relations: ['service'],
    });
  }

  async findOne(id: number) {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['service'],
    });
    if (!variant) {
      throw new NotFoundException(`ServiceVariant #${id} not found`);
    }
    return variant;
  }

  async update(id: number, dto: UpdateServiceVariantDto) {
    const variant = await this.findOne(id);
    this.variantRepository.merge(variant, {
      ...dto,
      service: dto.service_id ? { id: dto.service_id } : variant.service,
    });
    return await this.variantRepository.save(variant);
  }

  async remove(id: number) {
    const variant = await this.findOne(id);
    return await this.variantRepository.remove(variant);
  }
}
