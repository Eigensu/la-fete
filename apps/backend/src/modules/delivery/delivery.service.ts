import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { BorzoService } from './borzo.service';
import { DeliveryStatus } from '../../common/enums/delivery-status.enum';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(DeliverySlot)
    private slotRepository: Repository<DeliverySlot>,
    private borzoService: BorzoService,
  ) {}

  async getAvailableSlots(startDate: Date, endDate: Date): Promise<DeliverySlot[]> {
    return this.slotRepository
      .createQueryBuilder('slot')
      .where('slot.date >= :startDate', { startDate })
      .andWhere('slot.date <= :endDate', { endDate })
      .andWhere('slot.isActive = :isActive', { isActive: true })
      .andWhere('slot.currentBookings < slot.maxCapacity')
      .orderBy('slot.date', 'ASC')
      .addOrderBy('slot.startTime', 'ASC')
      .getMany();
  }

  async lockAndValidateSlot(
    slotId: string,
    manager: EntityManager,
  ): Promise<DeliverySlot> {
    const slot = await manager.findOne(DeliverySlot, {
      where: { id: slotId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!slot) {
      throw new NotFoundException('Delivery slot not found');
    }

    if (!slot.isActive) {
      throw new BadRequestException('Delivery slot is not active');
    }

    if (slot.currentBookings >= slot.maxCapacity) {
      throw new BadRequestException('Delivery slot is full');
    }

    return slot;
  }

  async estimateDelivery(latitude: number, longitude: number) {
    return this.borzoService.estimateDelivery(latitude, longitude);
  }

  async bookDelivery(orderId: string) {
    // This will be called by admin or scheduled job
    const orderRepo = this.deliveryRepository.manager.getRepository('Order');
    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'deliveryAddress'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Create Borzo delivery
    const borzoDelivery = await this.borzoService.createDelivery({
      orderId: order.id,
      pickupAddress: {
        name: 'La Fête Kitchen',
        phone: process.env.STORE_PHONE || '+91XXXXXXXXXX',
        address: process.env.STORE_ADDRESS || 'La Fête Kitchen, Mumbai',
        city: 'Mumbai',
        pincode: '400001',
        latitude: parseFloat(process.env.STORE_LATITUDE || '19.0760'),
        longitude: parseFloat(process.env.STORE_LONGITUDE || '72.8777'),
      },
      deliveryAddress: {
        name: `${order.user.firstName} ${order.user.lastName}`,
        phone: order.user.phone,
        address: order.deliveryAddress.street,
        city: order.deliveryAddress.city,
        pincode: order.deliveryAddress.pincode,
        latitude: order.deliveryAddress.latitude,
        longitude: order.deliveryAddress.longitude,
      },
      packageDetails: {
        weight: 2,
        description: 'Premium Cake',
      },
    });

    // Create or update delivery record
    let delivery = await this.deliveryRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (!delivery) {
      delivery = this.deliveryRepository.create({
        order: { id: orderId },
      });
    }

    delivery.borzoOrderId = borzoDelivery.borzoOrderId;
    delivery.trackingUrl = borzoDelivery.trackingUrl;
    delivery.actualCost = borzoDelivery.actualCost;
    delivery.status = DeliveryStatus.SEARCHING;

    await this.deliveryRepository.save(delivery);

    return delivery;
  }

  async trackDelivery(orderId: string) {
    const delivery = await this.deliveryRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (!delivery || !delivery.borzoOrderId) {
      throw new NotFoundException('Delivery not found');
    }

    const trackingInfo = await this.borzoService.trackDelivery(
      delivery.borzoOrderId,
    );

    return {
      delivery,
      trackingInfo,
    };
  }

  async createSlot(
    date: Date,
    startTime: string,
    endTime: string,
    maxCapacity: number = 5,
  ): Promise<DeliverySlot> {
    const slot = this.slotRepository.create({
      date,
      startTime,
      endTime,
      maxCapacity,
    });

    return this.slotRepository.save(slot);
  }

  async generateSlots(startDate: Date, endDate: Date) {
    const slots = [
      { startTime: '10:00:00', endTime: '13:00:00' },
      { startTime: '14:00:00', endTime: '17:00:00' },
      { startTime: '18:00:00', endTime: '21:00:00' },
    ];

    const createdSlots = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      for (const slot of slots) {
        const newSlot = await this.createSlot(
          new Date(currentDate),
          slot.startTime,
          slot.endTime,
        );
        createdSlots.push(newSlot);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return createdSlots;
  }
}
