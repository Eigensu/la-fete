import { IsNumber, Min, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

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
