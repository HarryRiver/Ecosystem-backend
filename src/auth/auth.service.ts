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
import { serializeUser } from '../common/api-serializers';

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
    const identity = (
      loginRequest.identity ??
      loginRequest.email ??
      ''
    )
      .trim()
      .toLowerCase();

    const user = await this.userRepository.findOne({
      where: [{ email: identity }, { phone: identity }],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === 'locked') {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    const match = await bcrypt.compare(loginRequest.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid password');
    }

    const tokens = await this.getTokens(user.id, user.email, this.getRoleList(user));
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    user.last_login_at = new Date();
    await this.userRepository.save(user);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: serializeUser(user)!,
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

      const tokens = await this.getTokens(user.id, user.email, this.getRoleList(user));
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        user: serializeUser(user)!,
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
        secret: process.env.JWT_SECRET || 'dev-access-secret',
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

    if (registerRequest.phone) {
      const duplicatePhone = await this.userRepository.findOne({
        where: { phone: registerRequest.phone },
      });
      if (duplicatePhone) {
        throw new BadRequestException('Phone is already in use');
      }
    }

    if (registerRequest.otp) {
      const otp = await this.otpRepository.findOne({
        where: {
          email: registerRequest.email,
          otpCode: registerRequest.otp,
        },
      });
      if (!otp) {
        throw new BadRequestException('Invalid OTP');
      }
    }

    const hashedPassword = await bcrypt.hash(registerRequest.password, 10);
    const userRole = await this.ensureCustomerRole();

    const user = this.userRepository.create({
      email: registerRequest.email,
      password: hashedPassword,
      roleSet: [userRole],
      full_name: registerRequest.full_name,
      phone: registerRequest.phone,
    });

    const savedUser = await this.userRepository.save(user);
    const tokens = await this.getTokens(
      savedUser.id,
      savedUser.email,
      this.getRoleList(savedUser),
    );
    await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: serializeUser(savedUser)!,
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

  private getRoleList(user: User): string[] {
    const roles = (user.roleSet ?? []).map((role) =>
      String(role.name ?? '').trim().toLowerCase(),
    );

    const normalizedRoles = roles.map((role) => {
      if (role === 'admin') {
        return 'admin';
      }
      return 'customer';
    });

    return [...new Set(normalizedRoles)];
  }

  private async ensureCustomerRole(): Promise<Role> {
    const existingRole =
      (await this.roleRepository.findOne({
        where: [{ name: 'customer' }, { name: 'Customer' }, { name: 'User' }],
      })) ?? null;

    if (existingRole) {
      return existingRole;
    }

    return await this.roleRepository.save(
      this.roleRepository.create({ name: 'customer' }),
    );
  }
}
