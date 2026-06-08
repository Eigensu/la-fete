/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly dataSource: DataSource,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    return (await this.getCart(userId)).cart;
  }

  async getCart(userId: string): Promise<any> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.variant'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: userId } });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    let priceChanged = false;
    const priceChanges: any[] = [];
    let hasUnavailableItems = false;

    // Price change and soft-delete detection
    for (const item of cart.items) {
      const variant = await this.variantRepository.findOne({
        where: { id: item.variant.id },
        withDeleted: true, // We want to see if it's deleted
      });

      const product = await this.productRepository.findOne({
        where: { id: item.product.id },
        withDeleted: true,
      });

      if (!variant || !product || variant.deletedAt || product.deletedAt || !product.isAvailable || !variant.isAvailable) {
        hasUnavailableItems = true;
        (item as any).isUnavailable = true;
        (item as any).unavailableReason = 'Product or variant is no longer available';
      } else {
        (item as any).isUnavailable = false;
        if (Number(item.unitPrice) !== Number(variant.price)) {
          priceChanged = true;
          priceChanges.push({
            itemId: item.id,
            oldPrice: Number(item.unitPrice),
            newPrice: Number(variant.price),
          });
          // Update unitPrice to match the current price
          item.unitPrice = variant.price;
          await this.cartItemRepository.save(item);
        }
        
        if (item.quantity > variant.stockQuantity) {
          hasUnavailableItems = true;
          (item as any).isUnavailable = true;
          (item as any).unavailableReason = `Only ${variant.stockQuantity} items left in stock`;
        }
      }
    }

    return {
      cart,
      priceChanged,
      priceChanges,
      hasUnavailableItems,
    };
  }

  async validateItem(dto: AddCartItemDto): Promise<{ product: Product, variant: ProductVariant }> {
    const product = await this.productRepository.findOne({ where: { id: dto.productId } });
    if (!product || !product.isAvailable) {
      throw new BadRequestException('Product is not available');
    }

    const variant = await this.variantRepository.findOne({ where: { id: dto.variantId }, relations: ['product'] });
    if (!variant || !variant.isAvailable) {
      throw new BadRequestException('Variant is not available');
    }

    if (variant.product.id !== product.id) {
      throw new BadRequestException('Variant does not belong to this product');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (dto.quantity > variant.stockQuantity) {
      throw new BadRequestException(`Not enough stock. Available: ${variant.stockQuantity}`);
    }

    return { product, variant };
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
    const { product, variant } = await this.validateItem(dto);

    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.variant'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: userId } });
      await this.cartRepository.save(cart);
      cart.items = [];
    }

    const existingItem = cart.items.find(item => item.variant.id === dto.variantId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (newQuantity > variant.stockQuantity) {
        throw new BadRequestException(`Cannot add that many. Only ${variant.stockQuantity} in stock.`);
      }
      existingItem.quantity = newQuantity;
      existingItem.unitPrice = variant.price; // Update to latest price
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        product,
        variant,
        quantity: dto.quantity,
        unitPrice: variant.price,
      });
      await this.cartItemRepository.save(newItem);
    }

    return (await this.getCart(userId)).cart;
  }

  async updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.variant'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    const variant = await this.variantRepository.findOne({ where: { id: item.variant.id } });
    if (!variant || !variant.isAvailable) {
      throw new BadRequestException('Variant is no longer available');
    }

    if (dto.quantity > variant.stockQuantity) {
      throw new BadRequestException(`Not enough stock. Available: ${variant.stockQuantity}`);
    }

    item.quantity = dto.quantity;
    item.unitPrice = variant.price;
    await this.cartItemRepository.save(item);

    return (await this.getCart(userId)).cart;
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(item);

    return (await this.getCart(userId)).cart;
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    if (cart && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  async validateCart(userId: string): Promise<{ valid: boolean, message?: string }> {
    const { hasUnavailableItems, priceChanged } = await this.getCart(userId);
    
    if (hasUnavailableItems) {
      return { valid: false, message: 'Some items in your cart are no longer available or out of stock. Please review your cart.' };
    }
    
    if (priceChanged) {
      return { valid: false, message: 'Prices for some items in your cart have changed. Please review your cart.' };
    }

    return { valid: true };
  }

  async mergeGuestCart(userId: string, dto: MergeCartDto): Promise<Cart> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.variant'],
      });

      if (!cart) {
        cart = queryRunner.manager.create(Cart, { user: { id: userId } });
        cart = await queryRunner.manager.save(cart);
        cart.items = [];
      }

      for (const item of dto.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: item.productId } });
        const variant = await queryRunner.manager.findOne(ProductVariant, { where: { id: item.variantId }, relations: ['product'] });

        if (!product || !product.isAvailable || !variant || !variant.isAvailable || variant.product.id !== product.id) {
          // Skip invalid items
          continue;
        }

        const existingItem = cart.items.find(i => i.variant.id === item.variantId);
        
        let targetQuantity = item.quantity;
        if (existingItem) {
          targetQuantity += existingItem.quantity;
        }

        // Cap at stock quantity
        if (targetQuantity > variant.stockQuantity) {
          targetQuantity = variant.stockQuantity;
        }

        if (targetQuantity <= 0) {
          continue;
        }

        if (existingItem) {
          existingItem.quantity = targetQuantity;
          existingItem.unitPrice = variant.price;
          await queryRunner.manager.save(existingItem);
        } else {
          const newItem = queryRunner.manager.create(CartItem, {
            cart,
            product,
            variant,
            quantity: targetQuantity,
            unitPrice: variant.price,
          });
          await queryRunner.manager.save(newItem);
        }
      }

      await queryRunner.commitTransaction();
      return (await this.getCart(userId)).cart;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async decreaseInventoryForOrder(items: { variantId: string, quantity: number }[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of items) {
        const result = await queryRunner.manager.createQueryBuilder()
          .update(ProductVariant)
          .set({ stockQuantity: () => `stockQuantity - ${item.quantity}` })
          .where('id = :id', { id: item.variantId })
          .andWhere('stockQuantity >= :quantity', { quantity: item.quantity })
          .execute();

        if (result.affected === 0) {
          throw new BadRequestException(`Failed to reserve stock for variant ${item.variantId}. Insufficient stock.`);
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
