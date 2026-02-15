import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../users/entities/address.entity';
import { DeliverySlot } from '../../delivery/entities/delivery-slot.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ManyToOne(() => DeliverySlot)
  @JoinColumn({ name: 'deliverySlotId' })
  deliverySlot: DeliverySlot;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'deliveryAddressId' })
  deliveryAddress: Address;

  @Column({ type: 'text', nullable: true })
  customMessage: string;

  @Column({ default: false })
  isGift: boolean;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
