import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum ImageRole {
  CUSTOMER_UPLOAD = 'customer_upload',
  // STAFF_ONSITE = 'staff_onsite',
  COMPLETION_PROOF = 'completion_proof',
}

export class CreateOrderImageDto {
  @IsString()
  file_url: string;

  @IsOptional()
  @IsString()
  mime_type?: string;

  @IsOptional()
  file_size?: number;

  @IsEnum(ImageRole)
  image_role: string;
}
