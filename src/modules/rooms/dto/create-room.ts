import {
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsNumber,
  IsInt,
} from 'class-validator';

export class CreateRoomDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  usersIds: number[];

  @IsNotEmpty()
  @IsNumber()
  testId: number;
}
