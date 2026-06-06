import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  ValidateIf,
} from 'class-validator';

export enum AdminOrderStatus {
  DRAFT = 'draft',
  AWAITING_PAYMENT = 'awaiting_payment',
  PENDING_CONFIRMATION = 'pending_confirmation',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AdminPaymentStatus {
  UNPAID = 'unpaid',
  AWAITING_PAYMENT = 'awaiting_payment',
  PAID = 'paid',
  FAILED = 'failed',
}

export class AdminUpdateOrderDto {
  @IsOptional()
  @IsEnum(AdminOrderStatus)
  status?: string;

  @IsOptional()
  @IsEnum(AdminPaymentStatus)
  payment_status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  final_total?: number;

  @ValidateIf((o) => o.final_total !== undefined)
  @IsString({
    message: 'Adjustment reason is required when final total is provided.',
  })
  adjustment_reason?: string;
}
