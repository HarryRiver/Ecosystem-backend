import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class QuoteItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  service_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  service_variant_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  measurement_value?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  custom_item_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  custom_item_note?: string;
}
