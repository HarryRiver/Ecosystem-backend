import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetPaymentsFilterDto } from './dto/get-payments-filter.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /payments/checkout/:id
   * Customer: Get a payment link to checkout an order via PayOS
   */
  @UseGuards(JwtAuthGuard)
  @Post('checkout/:orderId')
  async createCheckoutLink(@Param('orderId', ParseIntPipe) orderId: number) {
    return await this.paymentsService.createCheckoutLink(orderId);
  }

  /**
   * POST /payments/webhook
   * PayOS Call: Secure callback from PayOS
   */
  @Post('webhook')
  async handleWebhook(@Body() webhookData: any) {
    return await this.paymentsService.handleWebhook(webhookData);
  }

  /**
   * GET /payments/admin/list
   * Admin: List all historical payments with filters
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/list')
  async adminFindAll(@Query() filter: GetPaymentsFilterDto) {
    return await this.paymentsService.adminFindAll(filter);
  }
}
