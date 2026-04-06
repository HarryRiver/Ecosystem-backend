import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { LoginRequest } from './authentication/login.request';
import { LoginResponse } from './authentication/login.response';
import { RegisterRequest } from './authentication/register.request';
import { RegisterResponse } from './authentication/register.response';
import { EmailService } from './email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from '../otps/entities/otp.entity';
import { Role } from '../roles/entities/role.entity';
import { RequestPasswordResetDTO } from './dto/request-password-reset.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly JwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>, // Inject OtpRepository
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly emailService: EmailService,
  ) {}

  // ===================== LOGIN =====================
  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginRequest.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const match = await bcrypt.compare(loginRequest.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid password');
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.roleSet.map((r) => r.name),
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      userId: user.id,
      email: user.email,
      roleList: user.roleSet.map((r) => r.name),
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ===================== LOGOUT =====================
  async logout(userId: number) {
    return this.userRepository.update(userId, { refreshToken: null });
  }

  // ===================== REFRESH TOKEN =====================
  async refreshTokens(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = await this.JwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY',
      });
      const userId = payload.sub;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user || !user.refreshToken)
        throw new ForbiddenException('Access Denied');

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

      const tokens = await this.getTokens(
        user.id,
        user.email,
        user.roleSet.map((r) => r.name),
      );
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        userId: user.id,
        email: user.email,
        roleList: user.roleSet.map((r) => r.name),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (e) {
      throw new ForbiddenException('Access Denied');
    }
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: number, email: string, roles: string[]) {
    const payload = {
      sub: userId,
      email: email,
      roles: roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.JwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.JwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY',
        expiresIn: '7d', // Refresh token lives longer
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // ===================== REGISTER =====================
  async register(registerRequest: RegisterRequest): Promise<RegisterResponse> {
    const exist = await this.userRepository.findOne({
      where: { email: registerRequest.email },
    });
    if (exist) {
      throw new BadRequestException('Email is already in use');
    }

    const otp = await this.otpRepository.findOne({
      where: {
        email: registerRequest.email,
        otpCode: registerRequest.otp, // Đảm bảo bạn gọi đúng tên thuộc tính trong entity
      },
    });
    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const hashedPassword = await bcrypt.hash(registerRequest.password, 10);
    const userRole = await this.roleRepository.findOne({
      where: { name: 'User' },
    }); // Ví dụ tìm role từ database

    if (!userRole) {
      throw new Error('Role not found');
    }

    const user = this.userRepository.create({
      email: registerRequest.email, // Đảm bảo rằng registerRequest.email là một chuỗi hợp lệ
      password: hashedPassword, // Đảm bảo rằng hashedPassword đã được băm đúng cách
      roleSet: [userRole], // Gán roleSet là một mảng với role hợp lệ
      full_name: registerRequest.fullname,
      phone: registerRequest.phone,
    });

    await this.userRepository.save(user);
    return {
      email: registerRequest.email,
      fullname: registerRequest.fullname,
      phone: registerRequest.phone,
      password: registerRequest.password,
    };
  }

  // ===================== SEND OTP =====================
  async sendOtp(email: string): Promise<string> {
    const code = this.emailService.generateOTP();

    await this.otpRepository.save({
      email,
      otpCode: code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await this.emailService.sendOTPEmail(email, code);
    return code;
  }

  // ===================== REQUEST RESET =====================
  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      return 'Email not found!';
    }

    const code = this.emailService.generateOTP();

    await this.otpRepository.save({
      email,
      otpCode: code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await this.emailService.sendOTPEmail(email, code);
    return 'OTP sent to your email.';
  }

  // ===================== VERIFY OTP =====================
  async verifyOtp(email: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        otpCode: code,
      },
    });
    return !!otp;
  }

  // ===================== VALIDATE USER =====================
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, refreshToken, ...result } = user;
      return result;
    }
    return null;
  }

  // ===================== CHANGE PASSWORD =====================
  async changePassword(
    requestPasswordResetDTO: RequestPasswordResetDTO,
  ): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: requestPasswordResetDTO.email },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.password = await bcrypt.hash(requestPasswordResetDTO.newPassword, 10);
    this.userRepository.save(user);

    return 'Password changed successfully!';
  }
}
