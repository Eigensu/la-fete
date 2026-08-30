import { PaginationDto } from '../../../common/dto/pagination.dto';
import { IsOptional, IsString, IsBooleanString } from 'class-validator';

export class GetProductsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsBooleanString()
  featured?: string;
}
