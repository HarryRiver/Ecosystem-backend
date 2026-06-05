import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { PaymentMethod } from './create-order.dto';

export enum OrderSortField {
  CREATED_AT = 'created_at',
  BOOKING_DATE = 'booking_date',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetOrdersFilterDto {
  @IsOptional()
  @IsString()
  search?: string; // code, name, phone, email

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  district?: string; // Partial match in pickup_address

  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: string;

  @IsOptional()
  @IsEnum(OrderSortField)
  sortBy?: OrderSortField = OrderSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
