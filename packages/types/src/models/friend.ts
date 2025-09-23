import { User } from './user';

export class Friend {
  userId: User['userId'];
  nickname: User['nickname'];
  isFollowing: boolean;
}

export class FriendRequest {
  requestId: string;
  friendId: Friend['userId'];
  createdAt: Date;
}
