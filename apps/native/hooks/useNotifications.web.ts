import type {
  NotificationHandlers,
  NotificationPermissionStatus,
} from '@/types/notification-types';

const WEB_NOTIFICATION_PERMISSION: NotificationPermissionStatus = 'denied';

export function useNotifications(_handlers?: NotificationHandlers) {
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
