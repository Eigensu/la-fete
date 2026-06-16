import { Controller, Get, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAllAdmin(@Query('status') status?: string, @Query('search') search?: string) {
    return this.ordersService.findAllAdmin(status, search);
  }

  @Get(':id')
  findOneAdmin(@Param('id') id: string) {
    return this.ordersService.findOneAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }
}
