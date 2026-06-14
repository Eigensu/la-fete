import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  weight: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stockQuantity: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
