import type {
  UpdateWidgetRoutineConfigRequest,
  WidgetRoutineConfig,
  WidgetRoutineData,
  WidgetRoutineSize,
} from '@repo/types';

import { toAppError } from './http-client';
import { getWeekMonday, getWeekSunday } from '../utils';
import http from './client';

const widgetRoutinePath = '/users/me/widget-routines';

const createEmptyWidgetRoutineConfig = (): WidgetRoutineConfig => ({
  small: [],
  medium: [],
  large: [],
});

const normalizeWidgetRoutineConfig = (
  config: WidgetRoutineConfig | null | undefined,
): WidgetRoutineConfig => ({
  small: Array.isArray(config?.small) ? config.small : [],
  medium: Array.isArray(config?.medium) ? config.medium : [],
  large: Array.isArray(config?.large) ? config.large : [],
});

const createEmptyWidgetRoutineData = (
  size: WidgetRoutineSize,
): WidgetRoutineData => ({
  widgetSize: size,
  level: 0,
  exp: 0,
  expForNextLevel: 0,
  characterImageUrl: null,
  backgroundImageUrl: null,
  weekStartDate: getWeekMonday(new Date()),
  weekEndDate: getWeekSunday(new Date()),
  routines: [],
});

const normalizeWidgetRoutineData = (
  data: WidgetRoutineData | null | undefined,
  size: WidgetRoutineSize,
): WidgetRoutineData => {
  if (!data || !Array.isArray(data.routines)) {
    return createEmptyWidgetRoutineData(size);
  }

  return data;
};

export const fetchWidgetRoutineConfig =
  async (): Promise<WidgetRoutineConfig> => {
    try {
      const config = await http.get<
        WidgetRoutineConfig | null | undefined,
        void
      >(`${widgetRoutinePath}/config`);

      return config
        ? normalizeWidgetRoutineConfig(config)
        : createEmptyWidgetRoutineConfig();
    } catch (error) {
      throw toAppError(error);
    }
  };

export const updateWidgetRoutineConfig = async (
  request: UpdateWidgetRoutineConfigRequest,
): Promise<WidgetRoutineConfig> => {
  try {
    const config = await http.put<
      WidgetRoutineConfig | null | undefined,
      UpdateWidgetRoutineConfigRequest
    >(widgetRoutinePath, request);

    return config
      ? normalizeWidgetRoutineConfig(config)
      : createEmptyWidgetRoutineConfig();
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchWidgetRoutineData = async (
  size: WidgetRoutineSize,
): Promise<WidgetRoutineData> => {
  try {
    const data = await http.get<WidgetRoutineData | null | undefined, void>(
      `${widgetRoutinePath}?size=${encodeURIComponent(size)}`,
    );

    return normalizeWidgetRoutineData(data, size);
  } catch (error) {
    throw toAppError(error);
  }
};
