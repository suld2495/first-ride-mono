import type { User } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchNotificationSettings,
  type NotificationSettings,
  updateNotificationSettings,
  type UpdateNotificationSettingsRequest,
} from '../api/notification-settings.api';
import { notificationSettingsKeys } from '../types/query-keys/notification-settings';

export const useNotificationSettingsQuery = (userId: User['userId']) =>
  useQuery({
    queryKey: notificationSettingsKeys.detail(userId),
    queryFn: fetchNotificationSettings,
    enabled: !!userId,
  });

export const useUpdateNotificationSettingsMutation = (
  userId: User['userId'],
) => {
  const queryClient = useQueryClient();
  const queryKey = notificationSettingsKeys.detail(userId);

  const applyOptimisticSettings = (
    currentSettings: NotificationSettings | undefined,
    form: UpdateNotificationSettingsRequest,
  ): NotificationSettings | undefined => {
    if (!currentSettings) {
      return currentSettings;
    }

    return {
      allEnabled: form.allEnabled ?? currentSettings.allEnabled,
      subtypes: {
        ...currentSettings.subtypes,
        ...form.subtypes,
      },
    };
  };

  return useMutation({
    mutationFn: updateNotificationSettings,
    onMutate: async (form) => {
      try {
        await queryClient.cancelQueries({
          queryKey,
        });
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error('알림 설정 캐시 갱신을 준비하지 못했습니다.');
      }

      const previousSettings =
        queryClient.getQueryData<NotificationSettings>(queryKey);

      queryClient.setQueryData<NotificationSettings | undefined>(
        queryKey,
        (currentSettings) => applyOptimisticSettings(currentSettings, form),
      );

      return { previousSettings };
    },
    onError: (_error, _form, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKey, context.previousSettings);
      }
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKey, settings);
    },
  });
};
