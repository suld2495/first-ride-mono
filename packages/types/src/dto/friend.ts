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

export interface FriendCheerResponse {
  cheerId: number;
  senderId: number;
  senderNickname: User['nickname'];
  receiverId: number;
  receiverNickname: User['nickname'];
  message: string;
  createdAt: string;
}

export interface FriendRoutineProfile {
  backgroundImageUrl?: null | string;
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
  characterImageUrl: null | string;
  backgroundImageUrl: null | string;
}

export interface FriendRoutineItem {
  routineId: Routine['routineId'];
  routineName: Routine['routineName'];
  routineDetail: Routine['routineDetail'];
  penalty: Routine['penalty'];
  routineCount: Routine['routineCount'];
  symbolColor?: Routine['symbolColor'] | null;
  mateNickname: Routine['mateNickname'];
  startDate: Routine['startDate'];
  endDate: Routine['endDate'] | null;
  confirmCount: number;
  weeklyCount: Routine['weeklyCount'];
  successDate: Routine['successDate'] | null;
  todayConfirmStatus: Routine['todayConfirmStatus'];
  todayConfirmId: Routine['todayConfirmId'];
  canRequestToday: Routine['canRequestToday'];
  pendingConfirmations?: Routine['pendingConfirmations'] | null;
  displayOrder: number;
  paused: boolean;
  hidden: boolean;
}

export interface FriendRoutinesResponse {
  friend: FriendRoutineProfile;
  routines: FriendRoutineItem[];
}
