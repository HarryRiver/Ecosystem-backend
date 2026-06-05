import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsEnum(['furniture', 'electronics', 'metals', 'plastics', 'paper', 'clothes', 'vehicles', 'other'])
  category: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsEnum(['fixed', 'weight_based', 'quote_only'])
  pricing_type: string;

  @IsEnum(['item', 'bag', 'kg'])
  default_unit: string;

  @IsOptional()
  @IsNumber()
  base_price?: number;

  @IsOptional()
  @IsBoolean()
  manual_quote_required?: boolean;

  @IsOptional()
  @IsBoolean()
  requires_image?: boolean;

  @IsOptional()
  @IsBoolean()
  requires_custom_name?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}
