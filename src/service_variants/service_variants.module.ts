import { Module } from '@nestjs/common';
import { ServiceVariantsService } from './service_variants.service';
import { ServiceVariantsController } from './service_variants.controller';

@Module({
  controllers: [ServiceVariantsController],
  providers: [ServiceVariantsService],
})
export class ServiceVariantsModule {}
