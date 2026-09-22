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
import {
  SLOT_TIMES,
  ROLLING_WINDOW_DAYS,
  SLOT_SEARCH_DAYS,
  PG_UNIQUE_VIOLATION,
} from './delivery-slots.constants';
import {
  addDaysToDateString,
  earliestDeliveryInstant,
  isSlotDeliverable,
  parseDateParam,
  toDateString,
  zonedDateString,
} from './delivery-lead-time';

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

  async getAvailableSlots(
    startDate: Date | string,
    endDate: Date | string,
  ): Promise<DeliverySlot[]> {
    return this.slotRepository
      .createQueryBuilder('slot')
      .where('slot.date >= :startDate', { startDate: toDateString(startDate) })
      .andWhere('slot.date <= :endDate', { endDate: toDateString(endDate) })
      .andWhere('slot.isActive = :isActive', { isActive: true })
      .andWhere('slot.currentBookings < slot.maxCapacity')
      .orderBy('slot.date', 'ASC')
      .addOrderBy('slot.startTime', 'ASC')
      .getMany();
  }

  /**
   * The slots an order with this lead time may actually be delivered in.
   *
   * Filters on each slot's real start instant rather than its date alone.
   * A date-only filter offered a 10:00 next-day window to an order placed at
   * 23:00 — 11 hours of notice against an advertised 24.
   *
   * With no explicit range the caller gets exactly the earliest deliverable
   * day's windows, which is all checkout ever shows. That day is found by
   * searching forward instead of assuming it is `now + leadDays`: when the
   * lead time lands late in the day, every window on that date has already
   * passed and the first real options are the day after.
   */
  async getDeliverableSlots(
    leadDays: number,
    startDate?: string,
    endDate?: string,
  ): Promise<DeliverySlot[]> {
    const now = new Date();
    const earliest = earliestDeliveryInstant(leadDays, now);

    const requestedStart = parseDateParam(startDate);
    const requestedEnd = parseDateParam(endDate);

    // Never honour a requested start earlier than the lead time allows.
    const floor = zonedDateString(earliest);
    const rangeStart =
      requestedStart && requestedStart > floor ? requestedStart : floor;
    const rangeEnd =
      requestedEnd ?? addDaysToDateString(rangeStart, SLOT_SEARCH_DAYS);

    const slots = await this.getAvailableSlots(rangeStart, rangeEnd);
    const deliverable = slots.filter((slot) =>
      isSlotDeliverable(slot, leadDays, now),
    );

    // An explicit range means the caller wants that whole span (admin views);
    // otherwise narrow to the single earliest day that still has windows.
    if (requestedStart || requestedEnd || deliverable.length === 0) {
      return deliverable;
    }

    const earliestDate = toDateString(deliverable[0].date);
    return deliverable.filter(
      (slot) => toDateString(slot.date) === earliestDate,
    );
  }

  /**
   * @param leadDays the slowest lead time across the order's basket. The
   * availability endpoint already hides slots that are too soon, but it does
   * so from a value the client supplies — re-checking under the row lock is
   * what actually stops a crafted request booking a 48-hour gateau for
   * tomorrow. Omit only where no basket is involved.
   */
  async lockAndValidateSlot(
    slotId: string,
    manager: EntityManager,
    leadDays?: number,
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

    if (leadDays !== undefined && !isSlotDeliverable(slot, leadDays)) {
      throw new BadRequestException(
        `This delivery slot is too soon for your order — it needs at least ${leadDays * 24} hours' notice.`,
      );
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

  /** Idempotent: a date+time combo that already has an active slot is left
   *  alone, so this is safe to call repeatedly (an admin request, the nightly
   *  top-up job, or both landing on the same day).
   *
   *  The read and the insert are separate statements, so two callers can both
   *  see nothing and both insert. The partial unique index on
   *  (date, startTime) WHERE isActive settles that race in the database, and
   *  the losing insert is swallowed here — it lost by producing exactly the
   *  row we wanted. */
  async generateSlots(startDate: Date, endDate: Date) {
    const createdSlots: DeliverySlot[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      for (const slot of SLOT_TIMES) {
        const date = new Date(currentDate);
        const existing = await this.slotRepository.findOne({
          where: { date, startTime: slot.startTime, isActive: true },
        });
        if (existing) continue;

        try {
          const newSlot = await this.createSlot(
            date,
            slot.startTime,
            slot.endTime,
          );
          createdSlots.push(newSlot);
        } catch (err) {
          if ((err as { code?: string })?.code !== PG_UNIQUE_VIOLATION) throw err;
          this.logger.debug(
            `Slot ${toDateString(date)} ${slot.startTime} was created concurrently; skipping.`,
          );
        }
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
