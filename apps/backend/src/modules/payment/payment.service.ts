import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt,
      payment_capture: 1,
    };

    return await this.razorpay.orders.create(options);
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }

  async getPaymentDetails(paymentId: string) {
    return await this.razorpay.payments.fetch(paymentId);
  }

  async refundPayment(paymentId: string, amount?: number) {
    const refundData: any = { payment_id: paymentId };
    if (amount) {
      refundData.amount = amount * 100;
    }
    return await this.razorpay.payments.refund(paymentId, refundData);
  }
}