import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import type { Order } from '../orders/entities/order.entity';
import type { OrderItem } from '../order_items/entities/order_item.entity';

type OrderInvoiceEmailContext = {
  title?: string;
  statusLabel?: string;
};

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

  async sendOrderInvoiceEmail(
    order: Order,
    context: OrderInvoiceEmailContext = {},
  ): Promise<void> {
    const to = order.customer_email || order.customer?.email;
    if (!to) {
      this.logger.warn(
        `Don ${order.order_code} khong co email khach hang, bo qua gui hoa don.`,
      );
      return;
    }

    const title = context.title ?? 'Đặt lịch thu gom thành công';
    const statusLabel =
      context.statusLabel ?? this.getOrderStatusLabel(order.status);
    const subject = `EcoCollect - ${title} #${order.order_code}`;
    const text = this.buildOrderInvoiceText(order, title, statusLabel);
    const html = this.buildOrderInvoiceHtml(order, title, statusLabel);

    if (!this.transporter) {
      this.logger.warn(
        `MAIL_USER/MAIL_PASS chua duoc cau hinh, bo qua gui hoa don don ${order.order_code} toi ${to}.`,
      );
      this.logger.debug(text);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService?.get<string>('MAIL_USER'),
      to,
      subject,
      text,
      html,
    });
  }

  private buildOrderInvoiceText(
    order: Order,
    title: string,
    statusLabel: string,
  ): string {
    const customerName =
      order.customer_name || order.customer?.full_name || 'Quý khách';
    const bookingTime = [
      this.formatDate(order.booking_date),
      order.time_slot?.label,
    ]
      .filter(Boolean)
      .join(' - ');

    const items = (order.order_items ?? [])
      .map((item, index) => {
        const name = this.getItemName(item);
        const quantity = item.quantity ?? 0;
        const unit = item.unit ?? '';
        const lineTotal = this.formatCurrency(item.line_total);
        return `${index + 1}. ${name} - SL: ${quantity} ${unit} - ${lineTotal}`;
      })
      .join('\n');

    return [
      `Xin chào ${customerName},`,
      '',
      `${title}. EcoCollect gửi bạn thông tin hoá đơn cho đơn ${order.order_code}.`,
      `Trạng thái: ${statusLabel}`,
      bookingTime ? `Lịch hẹn: ${bookingTime}` : '',
      order.pickup_address ? `Địa chỉ thu gom: ${order.pickup_address}` : '',
      '',
      'Chi tiết dịch vụ:',
      items || 'Chưa có dịch vụ.',
      '',
      `Tạm tính dịch vụ: ${this.formatCurrency(order.service_subtotal)}`,
      `Phí xử lý: ${this.formatCurrency(order.handling_fee)}`,
      `Giảm giá: ${this.formatCurrency(order.discount_amount)}`,
      `Thành tiền: ${this.formatCurrency(order.final_total ?? order.estimated_total)}`,
      '',
      'Cảm ơn bạn đã sử dụng EcoCollect.',
    ]
      .filter((line) => line !== '')
      .join('\n');
  }

  private buildOrderInvoiceHtml(
    order: Order,
    title: string,
    statusLabel: string,
  ): string {
    const customerName = this.escapeHtml(
      order.customer_name || order.customer?.full_name || 'Quý khách',
    );
    const bookingTime = [
      this.formatDate(order.booking_date),
      order.time_slot?.label,
    ]
      .filter(Boolean)
      .join(' - ');
    const rows = (order.order_items ?? [])
      .map(
        (item) => `
          <tr>
            <td>${this.escapeHtml(this.getItemName(item))}</td>
            <td style="text-align:center;">${item.quantity ?? 0}</td>
            <td>${this.escapeHtml(item.unit ?? '')}</td>
            <td style="text-align:right;">${this.formatCurrency(item.unit_price)}</td>
            <td style="text-align:right;">${this.formatCurrency(item.line_total)}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <div style="margin:0;padding:24px;background:#f4faf6;font-family:Arial,sans-serif;color:#163d2c;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #d8eadf;border-radius:14px;overflow:hidden;">
          <div style="padding:28px 32px;background:#204f38;color:#ffffff;">
            <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#c8e6d2;">EcoCollect</div>
            <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">${this.escapeHtml(title)}</h1>
            <p style="margin:10px 0 0;color:#e7f3eb;">Mã đơn: <strong>${this.escapeHtml(order.order_code)}</strong></p>
          </div>

          <div style="padding:28px 32px;">
            <p style="margin:0 0 16px;">Xin chào <strong>${customerName}</strong>, EcoCollect gửi bạn hoá đơn cho lịch thu gom đã được xác nhận.</p>
            <div style="padding:16px;border:1px solid #d8eadf;border-radius:12px;background:#f8fcf9;">
              <p style="margin:0 0 8px;"><strong>Trạng thái:</strong> ${this.escapeHtml(statusLabel)}</p>
              ${bookingTime ? `<p style="margin:0 0 8px;"><strong>Lịch hẹn:</strong> ${this.escapeHtml(bookingTime)}</p>` : ''}
              ${order.pickup_address ? `<p style="margin:0;"><strong>Địa chỉ thu gom:</strong> ${this.escapeHtml(order.pickup_address)}</p>` : ''}
            </div>

            <h2 style="margin:26px 0 12px;font-size:18px;">Chi tiết hoá đơn</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead>
                <tr style="background:#eef7f1;">
                  <th style="padding:10px;text-align:left;border-bottom:1px solid #d8eadf;">Dịch vụ</th>
                  <th style="padding:10px;text-align:center;border-bottom:1px solid #d8eadf;">SL</th>
                  <th style="padding:10px;text-align:left;border-bottom:1px solid #d8eadf;">Đơn vị</th>
                  <th style="padding:10px;text-align:right;border-bottom:1px solid #d8eadf;">Đơn giá</th>
                  <th style="padding:10px;text-align:right;border-bottom:1px solid #d8eadf;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>${rows || '<tr><td colspan="5" style="padding:12px;text-align:center;">Chưa có dịch vụ.</td></tr>'}</tbody>
            </table>

            <div style="margin-top:22px;padding-top:16px;border-top:1px solid #d8eadf;">
              ${this.renderTotalLine('Tạm tính dịch vụ', order.service_subtotal)}
              ${this.renderTotalLine('Phí xử lý', order.handling_fee)}
              ${this.renderTotalLine('Giảm giá', order.discount_amount)}
              <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:20px;font-weight:700;">
                <span>Thành tiền</span>
                <span>${this.formatCurrency(order.final_total ?? order.estimated_total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderTotalLine(label: string, value: unknown): string {
    return `
      <div style="display:flex;justify-content:space-between;margin:6px 0;color:#3f5f4e;">
        <span>${this.escapeHtml(label)}</span>
        <span>${this.formatCurrency(value)}</span>
      </div>
    `;
  }

  private getItemName(item: OrderItem): string {
    return (
      item.service_variant_name ||
      item.variant_label_snapshot ||
      item.custom_item_name ||
      item.service_name_snapshot ||
      'Dịch vụ thu gom'
    );
  }

  private getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      awaiting_payment: 'Chờ thanh toán',
      pending_confirmation: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn tất',
      cancelled: 'Đã hủy',
      no_show: 'Không có mặt',
    };

    return labels[status] ?? status;
  }

  private formatCurrency(value: unknown): string {
    const amount = Number(value ?? 0);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
  }

  private formatDate(value?: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
