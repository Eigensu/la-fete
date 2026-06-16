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
    // Phase 1 Mock Delivery Estimate
    return { estimatedCost: 150 };
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

    // Create or update delivery record
    let delivery = await this.deliveryRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (!delivery) {
      delivery = this.deliveryRepository.create({
        order: { id: orderId },
      });
    }

    delivery.borzoOrderId = `mock_borzo_${Date.now()}`;
    delivery.trackingUrl = `/orders/${orderId}/track`; // Mock tracking URL
    delivery.actualCost = 150;
    delivery.status = DeliveryStatus.ASSIGNED;
    delivery.courierName = 'Mock Courier';
    delivery.courierPhone = '+91 99999 99999';

    await this.deliveryRepository.save(delivery);

    return delivery;
  }

  async trackDelivery(orderId: string) {
    const delivery = await this.deliveryRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return {
      delivery,
      trackingInfo: {
        status: delivery.status,
        courierName: delivery.courierName || 'Mock Courier',
        courierPhone: delivery.courierPhone || '+91 9999999999',
        trackingUrl: delivery.trackingUrl || '#',
      },
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
