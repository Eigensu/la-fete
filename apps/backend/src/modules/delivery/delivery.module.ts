import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { BorzoService } from './borzo.service';
import { Delivery } from './entities/delivery.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, DeliverySlot])],
  controllers: [DeliveryController],
  providers: [DeliveryService, BorzoService],
  exports: [DeliveryService, BorzoService],
})
export class DeliveryModule {}
