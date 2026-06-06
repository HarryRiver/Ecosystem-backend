import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
  IsDateString,
  IsBoolean,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(['percent', 'fixed'])
  type: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_discount?: number;

  @IsNumber()
  @Min(0)
  min_order_value: number;

  @IsInt()
  @Min(0)
  usage_limit: number;

  @IsInt()
  @Min(1)
  per_user_limit: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
