import {
  IsString,
  IsNumber,
  MinLength,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  newPassword: string;
}
