import { Routine, RoutineForm } from '../models/routine';

export type UpdateRoutineForm = RoutineForm & {
  routineId: Routine['routineId'];
};
