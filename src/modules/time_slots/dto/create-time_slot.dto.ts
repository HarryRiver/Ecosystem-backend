import { IsString, IsBoolean, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateTimeSlotDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  label: string;

  @IsString()
  start_time: string; // 'HH:mm:ss' format

  @IsString()
  end_time: string; // 'HH:mm:ss' format

  @IsNumber()
  max_orders: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
