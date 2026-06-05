import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceVariantsService } from './service_variants.service';
import { ServiceVariantsController } from './service_variants.controller';
import { ServiceVariant } from './entities/service_variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceVariant])],
  controllers: [ServiceVariantsController],
  providers: [ServiceVariantsService],
  exports: [ServiceVariantsService],
})
export class ServiceVariantsModule {}
