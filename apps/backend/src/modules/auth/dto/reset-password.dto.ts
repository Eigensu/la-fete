import { IsString, MinLength, IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @IsUUID()
  userId: string;

  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
