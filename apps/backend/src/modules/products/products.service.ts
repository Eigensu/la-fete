/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingSlug = await this.productRepository.findOne({
      where: { slug: createProductDto.slug },
      withDeleted: true,
    });
    if (existingSlug) {
      throw new ConflictException('Product with this slug already exists');
    }

    const category = await this.categoryRepository.findOne({ where: { id: createProductDto.categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      category,
    });
    return this.productRepository.save(product);
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    category?: string,
    subcategory?: string,
    featured?: boolean,
    availableOnly = false,
  ): Promise<PaginatedResponseDto<Product>> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variant')
      .orderBy('product.createdAt', 'DESC');

    if (availableOnly) {
      query.andWhere('product.isAvailable = :isAvailable', { isAvailable: true });
    }

    if (featured !== undefined) {
      query.andWhere('product.isFeatured = :featured', { featured });
    }

    if (category) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)) {
        query.andWhere('category.id = :categoryId', { categoryId: category });
      } else {
        query.andWhere('category.slug = :categorySlug', { categorySlug: category });
      }
    }

    if (subcategory) {
      // A product can sit in several collections, so match membership rather than
      // equality. `subcategory` is still accepted for products migrated before
      // `collections` was populated.
      query.andWhere(
        new Brackets((qb) => {
          qb.where(':collection = ANY(product.collections)', {
            collection: subcategory.toLowerCase(),
          }).orWhere('LOWER(product.subcategory) = :collection', {
            collection: subcategory.toLowerCase(),
          });
        }),
      );
    }

    if (search) {
      query.andWhere(new Brackets(qb => {
        qb.where('product.name ILIKE :search', { search: `%${search}%` })
          .orWhere('product.description ILIKE :search', { search: `%${search}%` })
          .orWhere('category.name ILIKE :search', { search: `%${search}%` });
      }));
    }

    const [items, totalItems] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(idOrSlug: string): Promise<Product> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variant');

    // Simple check if it's a UUID
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);

    if (isUuid) {
      query.where('product.id = :id', { id: idOrSlug });
    } else {
      query.where('product.slug = :slug', { slug: idOrSlug });
    }

    const product = await query.getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingSlug = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug },
        withDeleted: true,
      });
      if (existingSlug) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: updateProductDto.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      product.category = category;
    }

    Object.assign(product, updateProductDto);
    delete (product as any).categoryId;

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
  }
}
