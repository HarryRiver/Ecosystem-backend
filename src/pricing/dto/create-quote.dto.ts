import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuoteItemDto } from './quote-item.dto';

export enum HandlingMode {
  INSIDE = 'inside',
  OUTSIDE = 'outside',
  STAIRS = 'stairs',
}

export class CreateQuoteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];

  @IsEnum(HandlingMode)
  handling_mode: HandlingMode;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stairs_floors?: number;
}
