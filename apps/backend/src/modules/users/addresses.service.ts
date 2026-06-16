import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    return await this.dataSource.transaction(async (manager) => {
      if (createAddressDto.isDefault) {
        await manager.update(Address, { user: { id: userId } }, { isDefault: false });
      }

      const address = manager.create(Address, {
        ...createAddressDto,
        user: { id: userId },
      });

      return manager.save(address);
    });
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
    return await this.dataSource.transaction(async (manager) => {
      const address = await manager.findOne(Address, {
        where: { id, user: { id: userId } },
      });
      if (!address) throw new NotFoundException('Address not found');

      if (updateAddressDto.isDefault) {
        await manager.update(Address, { user: { id: userId } }, { isDefault: false });
      }

      Object.assign(address, updateAddressDto);
      return manager.save(address);
    });
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.addressRepository.remove(address);
    return { success: true };
  }

  async setDefault(id: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const address = await manager.findOne(Address, {
        where: { id, user: { id: userId } },
      });
      if (!address) throw new NotFoundException('Address not found');

      await manager.update(Address, { user: { id: userId } }, { isDefault: false });
      address.isDefault = true;
      return manager.save(address);
    });
  }
}
