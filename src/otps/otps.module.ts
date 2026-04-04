import { Module } from '@nestjs/common';
import { OtpsService } from './otps.service';
import { OtpsController } from './otps.controller';

@Module({
  controllers: [OtpsController],
  providers: [OtpsService],
})
export class OtpsModule {}
