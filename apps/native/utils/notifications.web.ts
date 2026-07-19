import type {
  NotificationContent,
  NotificationOptions,
  NotificationPermissionStatus,
  PushNotificationToken,
  ScheduledNotification,
} from '@/types/notification-types';

export {
  extractDeepLinkData,
  getCompletedRoutineRequestToastMessage,
  getDeepLinkPath,
  getNotificationNavigationIntent,
  type NotificationNavigationIntent,
} from './notification-navigation';

export function requestPermissions(): Promise<NotificationPermissionStatus> {
  return Promise.resolve('denied');
}

export function checkPermissions(): Promise<NotificationPermissionStatus> {
  return Promise.resolve('denied');
}

export function registerForPushNotifications(): Promise<PushNotificationToken | null> {
  return Promise.resolve(null);
}

export function scheduleLocalNotification(
  _options: NotificationOptions,
): Promise<string | null> {
  return Promise.resolve(null);
}

export function presentNotification(
  _content: NotificationContent,
): Promise<string | null> {
  return Promise.resolve(null);
}

export function cancelNotification(_identifier: string): Promise<boolean> {
  return Promise.resolve(false);
}

export function cancelAllNotifications(): Promise<boolean> {
  return Promise.resolve(false);
}

export function getAllScheduledNotifications(): Promise<
  ScheduledNotification[]
> {
  return Promise.resolve([]);
}

export function setupNotificationChannel(
  _channelId: string,
  _channelConfig: {
    name: string;
    description: string;
    importance: number;
    sound?: string;
    vibrate?: boolean;
    enableLights?: boolean;
    lightColor?: string;
  },
): Promise<boolean> {
  return Promise.resolve(false);
}

export function setupAllNotificationChannels(): Promise<void> {
  return Promise.resolve();
}

export function setBadgeCount(_count: number): Promise<boolean> {
  return Promise.resolve(false);
}

export function getBadgeCount(): Promise<number> {
  return Promise.resolve(0);
}

export function syncBadgeCountWithReceivedRequests(): Promise<number> {
  return Promise.resolve(0);
}

export function syncBadgeCountFromNotification(
  _notification: unknown,
): Promise<number> {
  return Promise.resolve(0);
}

export function clearBadgeCount(): Promise<boolean> {
  return Promise.resolve(false);
}
