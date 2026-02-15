import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { DeliveryService } from '../delivery/delivery.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private cartService: CartService,
    private productsService: ProductsService,
    private deliveryService: DeliveryService,
    private paymentsService: PaymentsService,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { deliverySlotId, deliveryAddressId, customMessage, isGift, specialInstructions } = createOrderDto;

    // Get user's cart
    const cart = await this.cartService.getOrCreateCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Start transaction
    return await this.dataSource.transaction(async (manager) => {
      // 1. Lock and validate delivery slot
      const slot = await this.deliveryService.lockAndValidateSlot(
        deliverySlotId,
        manager,
      );

      // 2. Validate and lock product variants
      const orderItems = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        const variantRepo = manager.getRepository('ProductVariant');
        const variant = await variantRepo.findOne({
          where: { id: cartItem.variant.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!variant) {
          throw new NotFoundException(
            `Variant ${cartItem.variant.id} not found`,
          );
        }

        if (variant.stockQuantity < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${variant.name}. Only ${variant.stockQuantity} available.`,
          );
        }

        // Decrement stock
        variant.stockQuantity -= cartItem.quantity;
        await manager.save(variant);

        // Calculate subtotal
        const itemSubtotal = Number(cartItem.priceAtAdd) * cartItem.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          variant,
          quantity: cartItem.quantity,
          priceAtPurchase: cartItem.priceAtAdd,
          subtotal: itemSubtotal,
        });
      }

      // 3. Estimate delivery fee
      const addressRepo = manager.getRepository('Address');
      const address = await addressRepo.findOne({
        where: { id: deliveryAddressId },
      });

      if (!address) {
        throw new NotFoundException('Delivery address not found');
      }

      const deliveryEstimate = await this.deliveryService.estimateDelivery(
        address.latitude,
        address.longitude,
      );

      const deliveryFee = deliveryEstimate.estimatedCost;
      const totalAmount = subtotal + deliveryFee;

      // 4. Generate order number
      const orderNumber = await this.generateOrderNumber();

      // 5. Create order
      const order = manager.create(Order, {
        orderNumber,
        user: { id: userId },
        status: OrderStatus.PENDING,
        subtotal,
        deliveryFee,
        totalAmount,
        deliverySlot: slot,
        deliveryAddress: address,
        customMessage,
        isGift: isGift || false,
        specialInstructions,
      });

      const savedOrder = await manager.save(order);

      // 6. Create order items
      for (const item of orderItems) {
        const orderItem = manager.create(OrderItem, {
          order: savedOrder,
          variant: item.variant,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          subtotal: item.subtotal,
        });
        await manager.save(orderItem);
      }

      // 7. Increment slot bookings
      slot.currentBookings += 1;
      await manager.save(slot);

      // 8. Create Razorpay order
      const razorpayOrder = await this.paymentsService.createRazorpayOrder(
        savedOrder.id,
        totalAmount,
        orderNumber,
        manager,
      );

      // 9. Clear cart
      await this.cartService.clearCart(userId);

      // Return order with payment details
      return {
        order: await manager.findOne(Order, {
          where: { id: savedOrder.id },
          relations: ['items', 'items.variant', 'items.variant.product', 'deliverySlot', 'deliveryAddress'],
        }),
        payment: razorpayOrder,
      };
    });
  }

  async findAll(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.variant', 'items.variant.product', 'deliverySlot'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: [
        'items',
        'items.variant',
        'items.variant.product',
        'deliverySlot',
        'deliveryAddress',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    orderId: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate state transition
    this.validateStatusTransition(order.status, updateStatusDto.status);

    order.status = updateStatusDto.status;
    return this.orderRepository.save(order);
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.BAKING, OrderStatus.CANCELLED],
      [OrderStatus.BAKING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DISPATCHED],
      [OrderStatus.DISPATCHED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.orderRepository.count();
    const orderNum = String(count + 1).padStart(4, '0');
    return `LF-${year}-${orderNum}`;
  }

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'deliveryAddress', 'deliverySlot'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
