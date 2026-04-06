import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import { CreateQuoteDto, HandlingMode } from '../../pricing/dto/create-quote.dto';

export enum PaymentMethod {
  CASH = 'cash',
  ONLINE = 'online',
}

export class CreateOrderDto extends CreateQuoteDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  time_slot_id?: number;

  @IsEnum(PaymentMethod)
  payment_method: string;

  @IsDateString()
  booking_date: string;

  @IsOptional()
  @IsBoolean()
  cash_policy_accepted?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  // Guest checkout details - if user is not authenticated
  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsEmail()
  customer_email?: string;

  @IsOptional()
  @IsString()
  pickup_address?: string;

  @IsOptional()
  @IsString()
  voucher_code?: string;
}
