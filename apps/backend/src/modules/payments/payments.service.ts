import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { RazorpayService } from './razorpay.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private razorpayService: RazorpayService,
  ) {}

  async createRazorpayOrder(
    orderId: string,
    amount: number,
    receipt: string,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Payment)
      : this.paymentRepository;

    // Create Razorpay order
    const razorpayOrder = await this.razorpayService.createOrder(
      amount,
      'INR',
      receipt,
    );

    // Save payment record
    const payment = repo.create({
      order: { id: orderId },
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: 'INR',
      status: PaymentStatus.CREATED,
    });

    await repo.save(payment);

    return {
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: 'INR',
    };
  }

  async verifyPayment(verifyDto: VerifyPaymentDto, manager?: EntityManager) {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = verifyDto;

    // Verify signature
    const isValid = this.razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    const repo = manager
      ? manager.getRepository(Payment)
      : this.paymentRepository;

    // Update payment
    const payment = await repo.findOne({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = PaymentStatus.CAPTURED;

    await repo.save(payment);

    // Update order status
    const orderRepo = manager
      ? manager.getRepository('Order')
      : this.paymentRepository.manager.getRepository('Order');

    await orderRepo.update({ id: orderId }, { status: OrderStatus.CONFIRMED });

    return {
      success: true,
      message: 'Payment verified successfully',
    };
  }

  async findByOrderId(orderId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
