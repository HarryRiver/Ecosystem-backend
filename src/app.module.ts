import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { OtpsModule } from './modules/otps/otps.module';
import { ServicesModule } from './modules/services/services.module';
import { ServiceVariantsModule } from './modules/service_variants/service_variants.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderItemsModule } from './modules/order_items/order_items.module';
import { OrderImagesModule } from './modules/order_images/order_images.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TimeSlotsModule } from './modules/time_slots/time_slots.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from 'db/db-source';
import { ConfigModule } from '@nestjs/config';
import { PricingModule } from './modules/pricing/pricing.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { CompatModule } from './modules/compat/compat.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSource.options),
    AuthModule,
    UsersModule,
    RolesModule,
    OtpsModule,
    ServicesModule,
    ServiceVariantsModule,
    OrdersModule,
    OrderItemsModule,
    OrderImagesModule,
    PaymentsModule,
    TimeSlotsModule,
    NotificationsModule,
    PricingModule,
    DashboardModule,
    VouchersModule,
    CompatModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
