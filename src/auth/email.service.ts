import { Injectable, Logger, Optional } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter?: nodemailer.Transporter;

  constructor(@Optional() private readonly configService?: ConfigService) {
    const user = this.configService?.get<string>('MAIL_USER');
    const pass = this.configService?.get<string>('MAIL_PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
  }

  generateOTP(): string {
    const code = randomInt(0, 1000000);
    return code.toString().padStart(6, '0');
  }

  async sendOTPEmail(to: string, code: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `MAIL_USER/MAIL_PASS chua duoc cau hinh, bo qua gui email OTP toi ${to}. OTP preview: ${code}`,
      );
      return;
    }

    const mailOptions = {
      from: this.configService?.get<string>('MAIL_USER'),
      to,
      subject: 'Exam Platform OTP Code',
      text: `Ma OTP cua ban la: ${code}`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
