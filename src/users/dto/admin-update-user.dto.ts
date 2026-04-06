import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  status?: string; // active, inactive, locked

  @IsOptional()
  @IsBoolean()
  prepaid_required?: boolean;

  @IsOptional()
  @IsBoolean()
  is_blacklisted?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
