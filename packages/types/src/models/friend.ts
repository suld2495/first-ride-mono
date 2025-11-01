import { User } from './user';

export interface Friend {
  nickname: User['nickname'];
  job: string;
  profileImage: null | string;
  friendSince: string;
}

export interface FriendRequest {
  id: number;
  senderNickname: User['nickname'];
  receiverNickname: User['nickname'];
  status: FriendRequestStatus;
  createdAt: Date;
}

export type FriendRequestStatus = 'PENDING';
