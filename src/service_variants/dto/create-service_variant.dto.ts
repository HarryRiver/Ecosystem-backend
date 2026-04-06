import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateServiceVariantDto {
  @IsInt()
  service_id: number;

  @IsString()
  code: string;

  @IsString()
  label: string;

  @IsEnum(['item', 'bag', 'kg'])
  unit: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
