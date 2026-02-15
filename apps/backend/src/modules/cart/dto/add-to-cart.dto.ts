import { IsUUID, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty()
  variantId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
