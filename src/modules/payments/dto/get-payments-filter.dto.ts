import { IsOptional, IsString } from 'class-validator';

export class GetPaymentsFilterDto {
  @IsOptional()
  @IsString()
  search?: string; // payment_code, provider_ref, order.order_code

  @IsOptional()
  @IsString()
  status?: string; // pending, paid, failed, cancelled, refunded
}
