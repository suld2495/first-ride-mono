export const WIDGET_ROUTINE_SIZES = ['SMALL', 'MEDIUM', 'LARGE'] as const;

export type WidgetRoutineSize = (typeof WIDGET_ROUTINE_SIZES)[number];
export type WidgetRoutineSizeKey = Lowercase<WidgetRoutineSize>;

export interface WidgetRoutineConfigItem {
  routineId: number;
  displayOrder: number;
}

export type WidgetRoutineConfig = Record<
  WidgetRoutineSizeKey,
  WidgetRoutineConfigItem[]
>;

export type UpdateWidgetRoutineConfigRequest = Record<
  WidgetRoutineSizeKey,
  number[]
>;

export interface WidgetRoutineDataRoutine {
  routineId: number;
  routineName: string;
  routineCount: number;
  completedCount: number;
  completedDates: string[];
}

export interface WidgetRoutineData {
  widgetSize: WidgetRoutineSize;
  level: number;
  exp: number;
  expForNextLevel: number;
  characterImageUrl: null | string;
  backgroundImageUrl: null | string;
  weekStartDate: string;
  weekEndDate: string;
  routines: WidgetRoutineDataRoutine[];
}
