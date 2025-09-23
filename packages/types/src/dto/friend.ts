import { Friend } from '../models/friend';

export class FriendRequestResponse {
  requestId: number;
  friendId: Friend['userId'];
  createdAt: string;
}
