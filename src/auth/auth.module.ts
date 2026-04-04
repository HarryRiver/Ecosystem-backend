import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [ConfigModule, PassportModule, JwtConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    EmailService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
