export const notificationSettingsKeys = {
  all: () => ['notification-settings'] as const,
  detail: () => [...notificationSettingsKeys.all(), 'detail'] as const,
};
