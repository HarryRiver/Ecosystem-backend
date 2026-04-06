import { Body, Controller, Post } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { PricingService } from './pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('quote')
  quote(@Body() createQuoteDto: CreateQuoteDto) {
    return this.pricingService.quote(createQuoteDto);
  }
}
