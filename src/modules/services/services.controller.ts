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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { serializeService } from '../../common/api-serializers';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * GET /services
   * Public: List only active services
   */
  @Get()
  async findAll() {
    const services = await this.servicesService.findAll();
    return services.map((service) => serializeService(service));
  }

  /**
   * GET /services/admin
   * Admin: List all services including inactive
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/list')
  async findAllAdmin() {
    const services = await this.servicesService.findAllAdmin();
    return services.map((service) => serializeService(service));
  }

  /**
   * GET /services/:id
   * Public: Get service details (including variants)
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return serializeService(await this.servicesService.findOne(id));
  }

  /**
   * POST /services
   * Admin: Create new service
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    return serializeService(await this.servicesService.create(createServiceDto));
  }

  /**
   * PATCH /services/:id
   * Admin: Update service
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return serializeService(await this.servicesService.update(id, updateServiceDto));
  }

  /**
   * DELETE /services/:id
   * Admin: Remove service
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.servicesService.remove(id);
  }
}
