import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Uniqueness of (date, startTime) is enforced by a PARTIAL unique index
 * covering only `isActive` rows — see the DeliverySlotIntegrity migration.
 * It cannot be a plain @Unique/@Index here: retired windows (the old
 * 14:00-17:00 afternoon slot, superseded duplicates) stay in the table
 * because `orders.deliverySlotId` references them ON DELETE NO ACTION, and a
 * full constraint would collide with that history.
 */
@Entity('delivery_slots')
export class DeliverySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'int', default: 5 })
  maxCapacity: number;

  @Column({ type: 'int', default: 0 })
  currentBookings: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
