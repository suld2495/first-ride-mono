import { FriendRequestStatus } from '../models/friend';
import { User } from '../models/user';

export interface FriendRequestResponse {
  id: number;
  senderNickname: User['nickname'];
  receiverNickname: User['nickname'];
  status: FriendRequestStatus;
  createdAt: string;
}
