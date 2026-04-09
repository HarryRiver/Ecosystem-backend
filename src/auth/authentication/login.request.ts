import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class LoginRequest {
  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  identity?: string;

  @ValidateIf((o) => !o.identity)
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
