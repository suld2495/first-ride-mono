import { User } from './user';

export interface Friend {
  backgroundImageUrl?: null | string;
  friendId: number | string;
  userId?: User['userId'];
  nickname: User['nickname'];
  motto: null | string;
  mottos: string[];
  mateNickname?: null | string;
  job: string;
  level: number;
  characterCode: string;
  characterImageUrl: null | string;
  friendSince?: string;
}

export interface FriendRequest {
  id: number;
  senderNickname: User['nickname'];
  senderCharacterImageUrl?: null | string;
  receiverNickname: User['nickname'];
  receiverId?: number;
  receiverCharacterImageUrl?: null | string;
  receiverBackgroundImageUrl?: null | string;
  status: FriendRequestStatus;
  createdAt: Date;
}

export type FriendRequestStatus = 'PENDING';
