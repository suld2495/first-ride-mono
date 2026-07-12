import { Request } from './request';

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
  hasPendingConfirmation: boolean;
  pendingConfirmationCount: number;
  pendingConfirmationIds: number[];
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
> & {
  successDate: string[];
};

export interface RoutineDetail {
  id: Request['id'];
  nickname: Routine['nickname'];
  requesterNickname: string;
  routineName: Routine['routineName'];
  routineDetail: Routine['routineDetail'];
  imagePath: Request['image'];
  createdAt: Request['createdAt'];
  checkStatus: Request['checkStatus'];
}
