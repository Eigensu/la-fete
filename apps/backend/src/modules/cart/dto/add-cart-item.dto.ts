import { IsUUID, IsNumber, Min, IsOptional, IsString, IsBoolean } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  sweetener?: string;

  @IsOptional()
  @IsBoolean()
  cakeTopper?: boolean;

  @IsOptional()
  @IsString()
  topperText?: string;

  @IsOptional()
  @IsBoolean()
  cakeMessage?: boolean;

  @IsOptional()
  @IsString()
  messageText?: string;
}
