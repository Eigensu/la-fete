import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  format?: string;

  @IsString()
  @IsOptional()
  dietaryTags?: string;

  @IsString()
  @IsOptional()
  otherTags?: string;

  @IsString()
  @IsOptional()
  ingredients?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sweetenerOptions?: string[];

  @IsString()
  @IsOptional()
  shelfLife?: string;

  @IsString()
  @IsOptional()
  allergyInformation?: string;

  @IsString()
  @IsOptional()
  deliveryInstructions?: string;

  @IsString()
  @IsOptional()
  nutritionalHighlight?: string;
}
