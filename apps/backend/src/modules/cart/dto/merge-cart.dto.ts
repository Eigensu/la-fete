import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddCartItemDto } from './add-cart-item.dto';

export class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCartItemDto)
  items: AddCartItemDto[];
}
