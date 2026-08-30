import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { GetProductsDto } from './dto/get-products.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('admin/products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch('admin/products/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete('admin/products/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('admin/products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAdmin(@Query() query: GetProductsDto) {
    return this.productsService.findAll(
      query.page,
      query.limit,
      query.search,
      query.category,
      query.subcategory,
      undefined,
      false, // Admin can see inactive
    );
  }

  @Get('products')
  findAllPublic(@Query() query: GetProductsDto) {
    return this.productsService.findAll(
      query.page,
      query.limit,
      query.search,
      query.category,
      query.subcategory,
      query.featured ? query.featured === 'true' : undefined,
      true, // Public only sees available
    );
  }

  @Get('products/:id')
  findOnePublic(@Param('id') idOrSlug: string) {
    return this.productsService.findOne(idOrSlug);
  }
}
