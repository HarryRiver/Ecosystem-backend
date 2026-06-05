import { IsOptional, IsString } from 'class-validator';

export class GetUsersFilterDto {
  @IsOptional()
  @IsString()
  search?: string; // name, phone, email

  @IsOptional()
  @IsString()
  status?: string; // active, inactive, locked

  @IsOptional()
  @IsString()
  role?: string; // admin, customer
}
