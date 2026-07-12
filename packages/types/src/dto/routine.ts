import { Routine, RoutineForm } from '../models/routine';

type CreateRoutinePayload = Pick<
  RoutineForm,
  'routineName' | 'startDate' | 'routineCount'
> & {
  endDate?: RoutineForm['endDate'] | null;
  routineDetail?: RoutineForm['routineDetail'];
  category?: string;
  symbolColor?: RoutineForm['symbolColor'];
};

export type CreateMyRoutineRequest = {
  target: 'me';
  payload: CreateRoutinePayload;
};

export type CreateMateRoutineRequest = {
  target: 'mate';
  payload: CreateRoutinePayload & Pick<RoutineForm, 'penalty' | 'mateNickname'>;
};

export type CreateRoutineRequest =
  | CreateMyRoutineRequest
  | CreateMateRoutineRequest;

export type UpdateRoutineForm = Partial<RoutineForm> & {
  routineId: Routine['routineId'];
  hidden?: Routine['hidden'];
  paused?: Routine['paused'];
};

type AppliedRoutineUpdateResponse = {
  mode: 'APPLIED';
  message: string;
  changeRequestId: null;
  changeRequest: null;
};

type ApprovalRequestedRoutineUpdateResponse = {
  mode: 'APPROVAL_REQUESTED';
  message: string;
  changeRequestId: number;
  changeRequest: {
    id: number;
  };
};

export type UpdateRoutineResponse =
  | AppliedRoutineUpdateResponse
  | ApprovalRequestedRoutineUpdateResponse;

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
