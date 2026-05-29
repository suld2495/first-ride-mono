import { FriendRequestStatus } from '../models/friend';
import { Routine } from '../models/routine';
import { User } from '../models/user';

export interface FriendRequestResponse {
  id: number;
  senderNickname: User['nickname'];
  receiverNickname: User['nickname'];
  status: FriendRequestStatus;
  createdAt: string;
}

export interface FriendRoutineProfile {
  id: number;
  nickname: User['nickname'];
  level: number;
  motto: null | string;
  job: string;
  characterCode: string;
  characterImageUrl: null | string;
}

export interface FriendProfileResponse {
  friendId: number | string;
  nickname: User['nickname'];
  job: string;
  motto: string;
  level: number;
  characterCode: string;
  characterImageUrl: string;
  backgroundImageUrl: string;
}

export interface FriendRoutineItem {
  routineId: Routine['routineId'];
  routineName: Routine['routineName'];
  routineDetail: Routine['routineDetail'];
  penalty: Routine['penalty'];
  routineCount: Routine['routineCount'];
  mateNickname: Routine['mateNickname'];
  startDate: Routine['startDate'];
  endDate: Routine['endDate'] | null;
  confirmCount: number;
  weeklyCount: Routine['weeklyCount'];
  successDate: Routine['successDate'] | null;
  displayOrder: number;
  paused: boolean;
  hidden: boolean;
}

export interface FriendRoutinesResponse {
  friend: FriendRoutineProfile;
  routines: FriendRoutineItem[];
}
