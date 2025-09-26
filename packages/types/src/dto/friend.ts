import { User } from 'src/models';

import { FriendRequestStatus } from '../models/friend';

export interface FriendRequestResponse {
  id: number;
  senderNickname: User['nickname'];
  receiverNickname: User['nickname'];
  status: FriendRequestStatus;
  createdAt: string;
}
