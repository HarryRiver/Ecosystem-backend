import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    const service = this.serviceRepository.create(createServiceDto);
    return await this.serviceRepository.save(service);
  }

  /**
   * Public: only active services (sorted)
   */
  async findAll() {
    return await this.serviceRepository.find({
      where: { active: true },
      relations: ['variants'],
      order: { sort_order: 'ASC' },
    });
  }

  /**
   * Admin: all services including inactive
   */
  async findAllAdmin() {
    return await this.serviceRepository.find({
      relations: ['variants'],
      order: { sort_order: 'ASC' },
    });
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }
    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(id);
    this.serviceRepository.merge(service, updateServiceDto);
    return await this.serviceRepository.save(service);
  }

  async remove(id: number) {
    const service = await this.findOne(id);
    return await this.serviceRepository.remove(service);
  }
}
