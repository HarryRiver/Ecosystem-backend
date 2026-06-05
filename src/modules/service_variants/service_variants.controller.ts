import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ServiceVariantsService } from './service_variants.service';
import { CreateServiceVariantDto } from './dto/create-service_variant.dto';
import { UpdateServiceVariantDto } from './dto/update-service_variant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('service-variants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ServiceVariantsController {
  constructor(
    private readonly serviceVariantsService: ServiceVariantsService,
  ) {}

  @Post()
  async create(@Body() createServiceVariantDto: CreateServiceVariantDto) {
    return await this.serviceVariantsService.create(createServiceVariantDto);
  }

  /**
   * GET /service-variants/service/:serviceId
   * Admin: List all variants for a specific service
   */
  @Get('service/:serviceId')
  async findByService(@Param('serviceId', ParseIntPipe) serviceId: number) {
    return await this.serviceVariantsService.findByService(serviceId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.serviceVariantsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceVariantDto: UpdateServiceVariantDto,
  ) {
    return await this.serviceVariantsService.update(id, updateServiceVariantDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.serviceVariantsService.remove(id);
  }
}
