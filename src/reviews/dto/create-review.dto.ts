import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  reviewer_name?: string;

  @IsEmail()
  @IsOptional()
  reviewer_email?: string;

  @IsInt()
  @IsOptional()
  user_id?: number;
}
