import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceVariantDto } from './create-service_variant.dto';

export class UpdateServiceVariantDto extends PartialType(CreateServiceVariantDto) {}
