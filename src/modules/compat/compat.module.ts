import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { ServicesModule } from '../services/services.module';
import { ServiceVariantsModule } from '../service_variants/service_variants.module';
import { TimeSlotsModule } from '../time_slots/time_slots.module';
import { UsersModule } from '../users/users.module';
import { CompatController } from './compat.controller';
import { VouchersModule } from '../vouchers/vouchers.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    OrdersModule,
    DashboardModule,
    ServicesModule,
    ServiceVariantsModule,
    TimeSlotsModule,
    PaymentsModule,
    VouchersModule,
  ],
  controllers: [CompatController],
})
export class CompatModule {}
