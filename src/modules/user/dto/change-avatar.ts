import { IsNumber, IsNotEmpty } from 'class-validator';

export class ChangeAvatarDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  avatarId: number;
}
