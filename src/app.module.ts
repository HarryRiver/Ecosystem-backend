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

@Module({
  imports: [AuthModule, UsersModule, RolesModule, OtpsModule, ServicesModule, ServiceVariantsModule, OrdersModule, OrderItemsModule, OrderImagesModule, PaymentsModule, TimeSlotsModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
