import type {
  NotificationHandlers,
  NotificationPermissionStatus,
  UseNotificationsOptions,
} from '@/types/notification-types';

const WEB_NOTIFICATION_PERMISSION: NotificationPermissionStatus = 'denied';

export function useNotifications(
  _handlers?: NotificationHandlers,
  _options?: UseNotificationsOptions,
) {
  return {
    permissionStatus: WEB_NOTIFICATION_PERMISSION,
    pushToken: null,
    notification: null,
    isInitialized: true,
    requestPermissions: () => Promise.resolve(WEB_NOTIFICATION_PERMISSION),
    registerPushNotifications: () => Promise.resolve(null),
  };
}

export function setNotificationHandler(): void {}
