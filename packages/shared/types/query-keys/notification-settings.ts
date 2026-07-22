import type { User } from '@repo/types';

export const notificationSettingsKeys = {
  all: (userId: User['userId']) => ['notification-settings', userId] as const,
  detail: (userId: User['userId']) =>
    [...notificationSettingsKeys.all(userId), 'detail'] as const,
};
