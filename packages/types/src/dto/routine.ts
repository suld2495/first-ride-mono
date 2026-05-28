import { Routine, RoutineForm } from '../models/routine';

export type UpdateRoutineForm = Partial<RoutineForm> & {
  routineId: Routine['routineId'];
  hidden?: Routine['hidden'];
  paused?: Routine['paused'];
};

export type UpdateRoutinePauseRequest = {
  routineId: Routine['routineId'];
  paused: Routine['paused'];
};

export type UpdateRoutineVisibilityRequest = {
  routineId: Routine['routineId'];
  hidden: Routine['hidden'];
};

export type UpdateRoutineOrderRequest = {
  routineIds: Routine['routineId'][];
};

export type RoutineActionResponse = {
  message: string;
};
