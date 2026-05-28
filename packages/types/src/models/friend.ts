import { User } from './user';

export interface Friend {
  id?: number | string;
  userId?: number | string;
  friendId?: number | string;
  accountId?: number | string;
  nickname: User['nickname'];
  motto: null | string;
  mottos: string[];
  mateNickname?: null | string;
  job: string;
  profileImage: null | string;
  level: number;
  characterCode: string;
  characterImageUrl: null | string;
  friendSince?: string;
}

export interface FriendRequest {
  id: number;
  senderNickname: User['nickname'];
  receiverNickname: User['nickname'];
  status: FriendRequestStatus;
  createdAt: Date;
}

export type FriendRequestStatus = 'PENDING';
