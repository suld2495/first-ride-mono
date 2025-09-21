import { User } from './user';

export class Friend {
  userId: User['userId'];
  nickname: User['nickname'];
  isFollowing: boolean;
}
