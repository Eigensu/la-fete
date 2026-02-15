import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: User) {
    const cart = await this.cartService.getOrCreateCart(user.id);
    const total = await this.cartService.getCartTotal(user.id);

    return {
      cart,
      total,
    };
  }

  @Post('items')
  addItem(@CurrentUser() user: User, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(user.id, addToCartDto);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: User,
    @Param('id') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, updateDto);
  }

  @Delete('items/:id')
  async removeItem(@CurrentUser() user: User, @Param('id') itemId: string) {
    await this.cartService.removeItem(user.id, itemId);
    return { message: 'Item removed from cart' };
  }

  @Delete()
  async clearCart(@CurrentUser() user: User) {
    await this.cartService.clearCart(user.id);
    return { message: 'Cart cleared' };
  }
}
