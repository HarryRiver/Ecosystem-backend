import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterRequest {
  @ApiProperty({
    description: "The email of the user",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty({
    description: "The full name of the user",
    example: "John Doe",
  })
  @IsNotEmpty({ message: "Full name is required" })
  @IsString({ message: "Full name must be a string" })
  fullname: string;

  @ApiProperty({
    description: "The phone number of the user",
    example: "1234567890",
  })
  @IsNotEmpty({ message: "Phone number is required" })
  @IsString({ message: "Phone number must be a string" })
  phone: string;

  @ApiProperty({
    description: "The password of the user",
    example: "password123",
  })
  @IsNotEmpty({ message: "Password is required" })
  @IsString({ message: "Password must be a string" })
  password: string;

  @ApiProperty({
    description: "The OTP code sent to email",
    example: "123456",
  })
  @IsNotEmpty({ message: "OTP is required" })
  @IsString({ message: "OTP must be a string" })
  otp: string;

  constructor(email: string, password: string, otp: string) {
    this.email = email;
    this.password = password;
    this.otp = otp;
  }
}
