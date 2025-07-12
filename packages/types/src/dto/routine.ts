import { Routine, RoutineForm } from 'src/models/routine';

export type UpdateRoutineForm = RoutineForm & {
  routineId: Routine['routineId'];
};
