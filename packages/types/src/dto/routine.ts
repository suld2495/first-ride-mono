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

export type UpdateRoutinePayload = Partial<
  Pick<
    RoutineForm,
    | 'routineName'
    | 'routineDetail'
    | 'penalty'
    | 'routineCount'
    | 'mateNickname'
    | 'startDate'
    | 'endDate'
    | 'symbolColor'
  > &
    Pick<Routine, 'hidden' | 'paused'> & {
      category: string;
    }
>;

export type UpdateRoutineForm = UpdateRoutinePayload & {
  routineId: Routine['routineId'];
};

export type RoutineChangeRequestSnapshot = {
  routineName: string;
  routineDetail: string;
  routineCount: number;
  startDate: string;
  endDate: string;
  penalty: number;
  mateId: number | null;
  mateNickname: string | null;
  category: string;
  symbolColor: string;
  hidden: boolean;
  paused: boolean;
};

export type RoutineChangeRequestChange = {
  field: string;
  label: string;
  before: unknown;
  after: unknown;
};

export type RoutineChangeRequest = {
  id: number;
  routineId: Routine['routineId'];
  routineName: string;
  requesterId: number;
  requesterNickname: string;
  approverId: number;
  approverNickname: string;
  status: 'PENDING';
  requestedRoutineName: string | null;
  requestedRoutineDetail: string | null;
  requestedRoutineCount: number | null;
  requestedStartDate: string | null;
  requestedEndDate: string | null;
  requestedPenalty: number | null;
  requestedMateId: number | null;
  requestedMateNickname: string | null;
  requestedCategory: string | null;
  requestedSymbolColor: string | null;
  requestedHidden: boolean | null;
  requestedPaused: boolean | null;
  before: RoutineChangeRequestSnapshot;
  after: RoutineChangeRequestSnapshot;
  changes: RoutineChangeRequestChange[];
  rejectReason: string | null;
  requestedAt: string;
  respondedAt: string | null;
  expiresAt: string;
};

export type RejectRoutineChangeRequest = {
  reason?: string;
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
  changeRequest: RoutineChangeRequest;
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

export type MonthlyRoutineListRequest = {
  year: number;
  month: number;
  activeOnly?: boolean;
};

export type MonthlyRoutineStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export type RoutineMonthlySummary = {
  routineId: number;
  routineName: string;
  routineDetail: string;
  category: string;
  symbolColor: string | null;
  penalty: number;
  routineCount: number;
  mateNickname: string | null;
  startDate: string | null;
  endDate: string | null;
  displayOrder: number | null;
  paused: boolean;
  hidden: boolean;
  completed: boolean;
  status: MonthlyRoutineStatus;
  achievedDates: string[];
  monthlyAchievedCount: number;
};

export type MonthlyRoutineListResponse = {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  activeOnly: boolean;
  routines: RoutineMonthlySummary[];
};
