import {
  Get,
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse } from './authentication/login.response';
import { LoginRequest } from './authentication/login.request';
import { RegisterResponse } from './authentication/register.response';
import { RegisterRequest } from './authentication/register.request';
import { RefreshTokenRequest } from './authentication/refresh-token.request';
import { RequestPasswordResetDTO } from './dto/request-password-reset.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(loginRequest);
  }

  @Post('refresh')
  async refresh(@Body() request: RefreshTokenRequest): Promise<LoginResponse> {
    return this.authService.refreshTokens(request.refreshToken);
  }

  @Post('register')
  async register(
    @Body() registerRequest: RegisterRequest,
  ): Promise<RegisterResponse> {
    return this.authService.register(registerRequest);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.userId);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: SendOtpDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('change-password')
  async changePassword(
    @Body() requestPasswordResetDTO: RequestPasswordResetDTO,
  ) {
    return this.authService.changePassword(requestPasswordResetDTO);
  }

  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }
}
