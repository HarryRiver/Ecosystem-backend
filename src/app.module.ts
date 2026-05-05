import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { OtpsModule } from './otps/otps.module';
import { ServicesModule } from './services/services.module';
import { ServiceVariantsModule } from './service_variants/service_variants.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { OrderImagesModule } from './order_images/order_images.module';
import { PaymentsModule } from './payments/payments.module';
import { TimeSlotsModule } from './time_slots/time_slots.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from 'db/db-source';
import { ConfigModule } from '@nestjs/config';
import { PricingModule } from './pricing/pricing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { CompatModule } from './compat/compat.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ".env",
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
  ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
