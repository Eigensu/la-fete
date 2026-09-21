import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, EntityManager, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { BorzoService } from './borzo.service';
import { DeliveryStatus } from '../../common/enums/delivery-status.enum';
import { SLOT_TIMES, ROLLING_WINDOW_DAYS } from './delivery-slots.constants';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

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

  /** Idempotent: a date+time combo that already has a slot is left alone,
   *  so this is safe to call repeatedly (an admin request, the nightly
   *  top-up job, or both landing on the same day). */
  async generateSlots(startDate: Date, endDate: Date) {
    const createdSlots: DeliverySlot[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      for (const slot of SLOT_TIMES) {
        const date = new Date(currentDate);
        const existing = await this.slotRepository.findOne({
          where: { date, startTime: slot.startTime },
        });
        if (existing) continue;

        const newSlot = await this.createSlot(date, slot.startTime, slot.endTime);
        createdSlots.push(newSlot);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return createdSlots;
  }

  /** Keeps a rolling window of future slots topped up automatically, so
   *  nobody has to remember to run a seed script as the calendar moves
   *  forward. Sweeps the whole window (tomorrow through the far edge)
   *  rather than just the day the window grew into: generateSlots skips
   *  dates that already have slots, so the sweep costs a handful of
   *  lookups and, unlike a single-day top-up, leaves no permanent hole if
   *  a night is missed or the window was seeded to a shorter horizon. */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async topUpRollingSlotWindow() {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);

    const edgeDate = new Date(start);
    edgeDate.setDate(edgeDate.getDate() + ROLLING_WINDOW_DAYS - 1);

    const created = await this.generateSlots(start, edgeDate);
    if (created.length > 0) {
      this.logger.log(`Rolling delivery-slot top-up: created ${created.length} new slot(s) through ${edgeDate.toDateString()}.`);
    }
  }
}
