import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../services/entities/service.entity';
import { ServiceVariant } from '../service_variants/entities/service_variant.entity';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { VouchersModule } from '../vouchers/vouchers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceVariant]),
    VouchersModule,
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
