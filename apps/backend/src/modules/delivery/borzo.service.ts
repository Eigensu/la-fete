import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
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

// Store location configuration
const STORE_LOCATION = {
  address: process.env.STORE_ADDRESS || 'La Fête Kitchen, Mumbai',
  latitude: parseFloat(process.env.STORE_LATITUDE || '19.0760'),
  longitude: parseFloat(process.env.STORE_LONGITUDE || '72.8777'),
  contactPerson: {
    name: 'La Fête Kitchen',
    phone: process.env.STORE_PHONE || '+91XXXXXXXXXX',
  },
};

const BORZO_CONFIG = {
  apiUrl: process.env.BORZO_API_URL || 'https://robot.borzodelivery.com/api/business/1.2',
  apiToken: process.env.BORZO_API_TOKEN || '',
  vehicleTypeId: 8, // Car (critical for cakes)
  deliveryRadius: 25000, // 25km in meters
};

@Injectable()
export class BorzoService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BORZO_CONFIG.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-DV-Auth-Token': BORZO_CONFIG.apiToken,
      },
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async estimateDelivery(latitude: number, longitude: number) {
    // Calculate distance
    const distance = this.calculateDistance(
      STORE_LOCATION.latitude,
      STORE_LOCATION.longitude,
      latitude,
      longitude,
    );

    if (distance > BORZO_CONFIG.deliveryRadius) {
      throw new BadRequestException(
        'Delivery address outside service area (25km radius)',
      );
    }

    try {
      const response = await this.axiosInstance.post('/calculate-order', {
        matter: 'Fragile Premium Cake',
        vehicle_type_id: BORZO_CONFIG.vehicleTypeId,
        points: [
          {
            address: STORE_LOCATION.address,
            latitude: STORE_LOCATION.latitude,
            longitude: STORE_LOCATION.longitude,
          },
          {
            address: 'Customer Address',
            latitude,
            longitude,
          },
        ],
      });

      const estimatedCost = response.data.order.payment_amount;
      const safetyBuffer = estimatedCost * 0.1; // 10% buffer

      return {
        estimatedCost: estimatedCost + safetyBuffer,
        distance: response.data.order.distance,
        duration: response.data.order.delivery_interval_minutes,
      };
    } catch (error) {
      // If Borzo API fails, return a default estimate
      console.error('Borzo API error:', error.message);
      return {
        estimatedCost: 100, // Default ₹100
        distance: Math.round(distance),
        duration: 60,
      };
    }
  }

  async createDelivery(deliveryData: CreateDeliveryDto) {
    try {
      const payload = {
        type: 'standard',
        matter: 'Fragile Premium Cake - Handle with Care',
        vehicle_type_id: BORZO_CONFIG.vehicleTypeId,
        insurance_amount: 2000,
        points: [
          {
            address: STORE_LOCATION.address,
            contact_person: {
              name: STORE_LOCATION.contactPerson.name,
              phone: STORE_LOCATION.contactPerson.phone,
            },
            latitude: STORE_LOCATION.latitude,
            longitude: STORE_LOCATION.longitude,
          },
          {
            address: deliveryData.deliveryAddress.address,
            contact_person: {
              name: deliveryData.deliveryAddress.name,
              phone: deliveryData.deliveryAddress.phone,
            },
            latitude: deliveryData.deliveryAddress.latitude,
            longitude: deliveryData.deliveryAddress.longitude,
          },
        ],
      };

      const response = await this.axiosInstance.post('/create-order', payload);

      return {
        borzoOrderId: response.data.order.order_id,
        trackingUrl: response.data.order.tracking_url,
        actualCost: response.data.order.payment_amount,
      };
    } catch (error) {
      throw new HttpException(
        `Borzo API Error: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async trackDelivery(deliveryId: string) {
    try {
      const response = await this.axiosInstance.get(`/orders/${deliveryId}`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Borzo API Error: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cancelDelivery(deliveryId: string, reason: string) {
    try {
      const response = await this.axiosInstance.post(`/orders/${deliveryId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Borzo API Error: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.BORZO_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  }
}