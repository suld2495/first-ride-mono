import { Request } from './request';

export interface PendingConfirmation {
  confirmId: number;
  date: string;
  status: 'WAIT';
}

export interface RoutineConfirmation {
  confirmId: number;
  date: string;
  status: 'WAIT' | 'PASS' | 'DENY';
}

export interface Routine {
  routineId: number;
  nickname: string;
  routineName: string;
  routineDetail: string;
  penalty: number;
  weeklyCount: number;
  routineCount: number;
  symbolColor?: string;
  mateNickname: string;
  isMe: boolean;
  startDate: string;
  endDate?: string;
  successDate: string[];
  paused: boolean;
  hidden: boolean;
  photoRequired: boolean;
  hasPendingConfirmation: boolean;
  pendingConfirmationCount: number;
  pendingConfirmationIds: number[];
  pendingConfirmations?: PendingConfirmation[];
  confirmations?: RoutineConfirmation[];
  todayConfirmStatus: 'WAIT' | 'PASS' | 'DENY' | null;
  todayConfirmId: number | null;
  canRequestToday: boolean;
  hasPendingChangeRequest?: boolean;
  pendingChangeRequestId?: number | null;
  pendingChangeRequestStatus?: 'PENDING' | null;
}

export type RoutineForm = Omit<
  Routine,
  | 'routineId'
  | 'weeklyCount'
  | 'successDate'
  | 'paused'
  | 'hidden'
  | 'hasPendingConfirmation'
  | 'pendingConfirmationCount'
  | 'pendingConfirmationIds'
  | 'pendingConfirmations'
  | 'confirmations'
  | 'todayConfirmStatus'
  | 'todayConfirmId'
  | 'canRequestToday'
  | 'hasPendingChangeRequest'
  | 'pendingChangeRequestId'
  | 'pendingChangeRequestStatus'
>;

export type WeeklyRoutine = Pick<
  Routine,
  | 'routineId'
  | 'routineName'
  | 'weeklyCount'
  | 'routineCount'
  | 'startDate'
  | 'endDate'
  | 'paused'
  | 'hidden'
  | 'hasPendingConfirmation'
  | 'pendingConfirmationCount'
  | 'pendingConfirmationIds'
  | 'pendingConfirmations'
  | 'confirmations'
> & {
  successDate: string[];
};

export interface RoutineDetail {
  id: Request['id'];
  nickname: Routine['nickname'];
  requesterNickname: string;
  requesterCharacterImageUrl?: null | string;
  responderCharacterImageUrl?: null | string;
  routineName: Routine['routineName'];
  routineDetail: Routine['routineDetail'];
  imagePaths: Request['image'][];
  createdAt: Request['createdAt'];
  checkedAt?: Request['createdAt'] | null;
  checkStatus: Request['checkStatus'];
  message: Request['message'];
  checkComment?: Request['checkComment'] | null;
}
