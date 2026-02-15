import { IsDateString, IsNotEmpty } from 'class-validator';

export class GenerateSlotsDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
