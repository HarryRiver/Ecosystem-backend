import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VounchersService } from './vounchers.service';
import { VounchersController } from './vounchers.controller';
import { Vouncher } from './entities/vouncher.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vouncher, Order])],
  controllers: [VounchersController],
  providers: [VounchersService],
  exports: [VounchersService],
})
export class VounchersModule {}
