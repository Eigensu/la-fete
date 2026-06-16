import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Req() req: Request, @Body() createAddressDto: CreateAddressDto) {
    const userId = (req.user as any).id;
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.addressesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).id;
    return this.addressesService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    const userId = (req.user as any).id;
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).id;
    return this.addressesService.remove(id, userId);
  }

  @Patch(':id/default')
  setDefault(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).id;
    return this.addressesService.setDefault(id, userId);
  }
}
