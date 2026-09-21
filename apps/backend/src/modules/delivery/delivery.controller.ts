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
    // Tea Cakes and Tub Cakes ship next-day (1); a signature gateau or any
    // other celebration cake needs the full 48 hours (2, the default) —
    // the caller sends the slowest lead time across everything in the cart.
    @Query('minLeadDays') minLeadDays?: string,
  ) {
    const leadDays = Math.max(1, parseInt(minLeadDays ?? '2', 10) || 2);

    const earliest = new Date();
    earliest.setDate(earliest.getDate() + leadDays);
    earliest.setHours(0, 0, 0, 0);

    const requestedStart = startDate ? new Date(startDate) : earliest;
    const start = requestedStart > earliest ? requestedStart : earliest;
    // No caller ever needs more than the single earliest deliverable date's
    // slots — checkout shows exactly that day's three windows, nothing
    // beyond it, so default the window to just that one day.
    const end = endDate ? new Date(endDate) : start;

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
