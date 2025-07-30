import { IsNotEmpty, IsString } from 'class-validator';
import { UserRoles } from '../../../types/user';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsString()
  newRole: UserRoles;
}
