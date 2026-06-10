/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  addItem(@Req() req: any, @Body() addCartItemDto: AddCartItemDto) {
    return this.cartService.addItem(req.user.id, addCartItemDto);
  }

  @Patch('items/:id')
  updateItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(req.user.id, id, updateCartItemDto);
  }

  @Delete('items/:id')
  removeItem(@Req() req: any, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Delete()
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }

  @Post('validate')
  validateCart(@Req() req: any) {
    return this.cartService.validateCart(req.user.id);
  }

  @Post('merge')
  mergeCart(@Req() req: any, @Body() mergeCartDto: MergeCartDto) {
    return this.cartService.mergeGuestCart(req.user.id, mergeCartDto);
  }
}
