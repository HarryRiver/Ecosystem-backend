import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceVariantsService } from './service_variants.service';
import { CreateServiceVariantDto } from './dto/create-service_variant.dto';
import { UpdateServiceVariantDto } from './dto/update-service_variant.dto';

@Controller('service-variants')
export class ServiceVariantsController {
  constructor(private readonly serviceVariantsService: ServiceVariantsService) {}

  @Post()
  create(@Body() createServiceVariantDto: CreateServiceVariantDto) {
    return this.serviceVariantsService.create(createServiceVariantDto);
  }

  @Get()
  findAll() {
    return this.serviceVariantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceVariantsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceVariantDto: UpdateServiceVariantDto) {
    return this.serviceVariantsService.update(+id, updateServiceVariantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceVariantsService.remove(+id);
  }
}
