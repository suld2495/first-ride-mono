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
  friend?: boolean;
  isFriend?: boolean;
  confirmationImagesVisibleToFriends?: boolean;
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
  evolutionCount?: number;
}

export interface RandomFriendRecommendationRoutine {
  routineName: string;
  routineDetail: string;
  category: string;
  symbolColor: string;
  routineCount: number;
}

export interface RandomFriendRecommendationResponse {
  friendId: number | string;
  nickname: User['nickname'];
  level: number;
  job: string;
  motto: null | string;
  characterCode: string;
  characterImageUrl: null | string;
  backgroundImageUrl: null | string;
  recommendedDate: string;
  routines: RandomFriendRecommendationRoutine[];
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
  confirmations?: Routine['confirmations'] | null;
  todayConfirmStatus: Routine['todayConfirmStatus'];
  todayConfirmId: Routine['todayConfirmId'];
  canRequestToday: Routine['canRequestToday'];
  displayOrder: number;
  paused: boolean;
  hidden: boolean;
  photoRequired: Routine['photoRequired'];
}

export interface FriendRoutinesResponse {
  friend: FriendRoutineProfile;
  isFriend?: boolean;
  routines: FriendRoutineItem[];
}
