import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    if (createAddressDto.isDefault) {
      await this.addressRepository.update({ user: { id: userId } }, { isDefault: false });
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      user: { id: userId },
    });

    return this.addressRepository.save(address);
  }

  async findAll(userId: string) {
    return this.addressRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async update(id: string, userId: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOne(id, userId);

    if (updateAddressDto.isDefault) {
      await this.addressRepository.update({ user: { id: userId } }, { isDefault: false });
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.addressRepository.remove(address);
    return { success: true };
  }

  async setDefault(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.addressRepository.update({ user: { id: userId } }, { isDefault: false });
    address.isDefault = true;
    return this.addressRepository.save(address);
  }
}
