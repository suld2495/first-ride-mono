import { Request } from './request';

export interface Routine {
  routineId: number;
  nickname: string;
  routineName: string;
  routineDetail: string;
  penalty: number;
  weeklyCount: number;
  routineCount: number;
  mateNickname: string;
  startDate: string;
  endDate?: string;
  successDate: string[];
}

export type RoutineForm = Omit<
  Routine,
  'routineId' | 'weeklyCount' | 'successDate'
>;

export type WeeklyRoutine = Pick<
  Routine,
  | 'routineId'
  | 'routineName'
  | 'weeklyCount'
  | 'routineCount'
  | 'startDate'
  | 'endDate'
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
}
