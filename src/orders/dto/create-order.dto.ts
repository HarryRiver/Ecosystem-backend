import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { CreateQuoteDto } from '../../pricing/dto/create-quote.dto';

export enum PaymentMethod {
  CASH = 'cash',
  ONLINE = 'online',
}

class OrderCustomerDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

class OrderAddressDto {
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  province?: string;
}

export class CreateOrderDto extends CreateQuoteDto {
  @IsOptional()
  @Type(() => String)
  @IsString()
  time_slot_id?: string;

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

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderCustomerDto)
  customer?: OrderCustomerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderAddressDto)
  address?: OrderAddressDto;

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
