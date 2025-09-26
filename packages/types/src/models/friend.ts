import { User } from './user';

export interface Friend {
  nickname: User['nickname'];
  job: string;
  profileImage: null | string;
  friendSince: string;
}

export interface FriendRequest {
  requestId: string;
  friendNickname: Friend['nickname'];
  createdAt: Date;
}

export type FriendRequestStatus = 'PENDING';
