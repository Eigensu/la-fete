import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: userId } });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItem(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { variantId, quantity } = addToCartDto;

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Check variant availability and stock
    const variant = await this.productsService.findVariantById(variantId);

    if (!variant.isAvailable || !variant.product.isAvailable) {
      throw new BadRequestException('Product is not available');
    }

    if (variant.stockQuantity < quantity) {
      throw new BadRequestException(
        `Only ${variant.stockQuantity} items available in stock`,
      );
    }

    // Check if item already exists in cart
    const existingItem = cart.items?.find(
      (item) => item.variant.id === variantId,
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (variant.stockQuantity < newQuantity) {
        throw new BadRequestException(
          `Only ${variant.stockQuantity} items available in stock`,
        );
      }

      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new cart item
      const cartItem = this.cartItemRepository.create({
        cart,
        variant,
        quantity,
        priceAtAdd: variant.price,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getOrCreateCart(userId);
  }

  async updateItem(
    userId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items?.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Check stock availability
    const variant = await this.productsService.findVariantById(
      item.variant.id,
    );

    if (variant.stockQuantity < updateDto.quantity) {
      throw new BadRequestException(
        `Only ${variant.stockQuantity} items available in stock`,
      );
    }

    item.quantity = updateDto.quantity;
    await this.cartItemRepository.save(item);

    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items?.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(item);

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.items && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  async getCartTotal(userId: string): Promise<number> {
    const cart = await this.getOrCreateCart(userId);

    if (!cart.items || cart.items.length === 0) {
      return 0;
    }

    return cart.items.reduce(
      (total, item) => total + Number(item.priceAtAdd) * item.quantity,
      0,
    );
  }
}
