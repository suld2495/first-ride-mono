import type { WidgetRoutineSize } from '@repo/types';

export const widgetRoutineKeys = {
  all: () => ['widget-routine'] as const,
  config: () => [...widgetRoutineKeys.all(), 'config'] as const,
  data: (size: WidgetRoutineSize) =>
    [...widgetRoutineKeys.all(), 'data', size] as const,
};
