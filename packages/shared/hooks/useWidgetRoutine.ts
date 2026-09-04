import type {
  UpdateWidgetRoutineConfigRequest,
  WidgetRoutineSize,
} from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchWidgetRoutineConfig,
  fetchWidgetRoutineData,
  updateWidgetRoutineConfig,
} from '../api/widget-routine.api';
import { widgetRoutineKeys } from '../types/query-keys/widget-routine';

export const useWidgetRoutineConfigQuery = () =>
  useQuery({
    queryKey: widgetRoutineKeys.config(),
    queryFn: fetchWidgetRoutineConfig,
    refetchOnMount: 'always',
  });

export const useWidgetRoutineDataQuery = (size: WidgetRoutineSize) =>
  useQuery({
    queryKey: widgetRoutineKeys.data(size),
    queryFn: () => fetchWidgetRoutineData(size),
    enabled: !!size,
    refetchOnMount: 'always',
  });

export const useSaveWidgetRoutineConfigMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateWidgetRoutineConfigRequest) =>
      updateWidgetRoutineConfig(request),
    onSuccess: async (config) => {
      queryClient.setQueryData(widgetRoutineKeys.config(), config);
      await queryClient.invalidateQueries({
        queryKey: widgetRoutineKeys.all(),
      });
    },
  });
};
