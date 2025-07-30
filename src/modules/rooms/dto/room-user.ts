import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class RoomUser {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  ready: boolean;

  @Expose()
  avatarId: number;
}
