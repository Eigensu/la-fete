import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { GenerateSlotsDto } from './dto/generate-slots.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('slots')
  async getAvailableSlots(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    return this.deliveryService.getAvailableSlots(start, end);
  }

  @Get('estimate')
  async estimateDelivery(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    return this.deliveryService.estimateDelivery(
      parseFloat(latitude),
      parseFloat(longitude),
    );
  }

  @Post('book/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async bookDelivery(@Param('orderId') orderId: string) {
    return this.deliveryService.bookDelivery(orderId);
  }

  @Get('track/:orderId')
  @UseGuards(JwtAuthGuard)
  async trackDelivery(@Param('orderId') orderId: string) {
    return this.deliveryService.trackDelivery(orderId);
  }

  @Post('slots/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async generateSlots(@Body() generateSlotsDto: GenerateSlotsDto) {
    const startDate = new Date(generateSlotsDto.startDate);
    const endDate = new Date(generateSlotsDto.endDate);

    return this.deliveryService.generateSlots(startDate, endDate);
  }
}
