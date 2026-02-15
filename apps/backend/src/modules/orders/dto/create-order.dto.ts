import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  deliverySlotId: string;

  @IsUUID()
  @IsNotEmpty()
  deliveryAddressId: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  customMessage?: string;

  @IsBoolean()
  @IsOptional()
  isGift?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  specialInstructions?: string;
}
