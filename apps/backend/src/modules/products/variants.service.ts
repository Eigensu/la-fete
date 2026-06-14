/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(productId: string, createVariantDto: CreateVariantDto): Promise<ProductVariant> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingName = await this.variantRepository.findOne({
      where: { product: { id: productId }, name: createVariantDto.name },
      withDeleted: true,
    });
    
    if (existingName) {
      throw new ConflictException('Variant with this name already exists for the product');
    }

    const variant = this.variantRepository.create({
      ...createVariantDto,
      product,
    });

    return this.variantRepository.save(variant);
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return variant;
  }

  async update(id: string, updateVariantDto: UpdateVariantDto): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    if (updateVariantDto.name && updateVariantDto.name !== variant.name) {
      const existingName = await this.variantRepository.findOne({
        where: { product: { id: variant.product.id }, name: updateVariantDto.name },
        withDeleted: true,
      });

      if (existingName) {
        throw new ConflictException('Variant with this name already exists for the product');
      }
    }

    Object.assign(variant, updateVariantDto);
    return this.variantRepository.save(variant);
  }

  async remove(id: string): Promise<void> {
    const variant = await this.findOne(id);
    await this.variantRepository.softRemove(variant);
  }
}
