import { IsUUID, IsNumber, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
