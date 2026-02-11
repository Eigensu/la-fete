import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

interface CreateDeliveryDto {
  orderId: string;
  pickupAddress: DeliveryAddress;
  deliveryAddress: DeliveryAddress;
  packageDetails: {
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    description: string;
  };
  scheduledPickupTime?: Date;
}

@Injectable()
export class WeFastService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.WEFAST_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.WEFAST_API_KEY,
        'X-API-Secret': process.env.WEFAST_API_SECRET,
      },
    });
  }

  async createDelivery(deliveryData: CreateDeliveryDto) {
    try {
      const response = await this.axiosInstance.post('/deliveries', deliveryData);
      return response.data;
    } catch (error) {
      throw new HttpException(
        `WeFast API Error: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async trackDelivery(deliveryId: string) {
    try {
      const response = await this.axiosInstance.get(`/deliveries/${deliveryId}/track`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        `WeFast API Error: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cancelDelivery(deliveryId: string, reason: string) {
    try {
      const response = await this.axiosInstance.post(`/deliveries/${deliveryId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `WeFast API Error: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDeliveryEstimate(pickupPincode: string, deliveryPincode: string, weight: number) {
    try {
      const response = await this.axiosInstance.post('/deliveries/estimate', {
        pickupPincode,
        deliveryPincode,
        weight,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `WeFast API Error: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEFAST_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  }
}