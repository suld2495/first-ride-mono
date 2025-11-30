import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import {
  CATEGORY_TO_CHANNEL,
  DEFAULT_NOTIFICATION_CONFIG,
  NOTIFICATION_CHANNELS,
  PRIORITY_MAPPING,
} from '@/constants/notifications';
import type {
  NotificationContent,
  NotificationOptions,
  NotificationPermissionStatus,
  NotificationTrigger,
  PushNotificationToken,
  ScheduledNotification,
} from '@/types/notification.types';

/**
 * 알림 권한 요청
 */
export async function requestPermissions(): Promise<NotificationPermissionStatus> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    return finalStatus as NotificationPermissionStatus;
  } catch {
    return 'denied';
  }
}

/**
 * 알림 권한 상태 확인
 */
export async function checkPermissions(): Promise<NotificationPermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();

    return status as NotificationPermissionStatus;
  } catch {
    return 'undetermined';
  }
}

/**
 * 푸시 알림 토큰 등록
 */
export async function registerForPushNotifications(): Promise<PushNotificationToken | null> {
  try {
    // 실제 디바이스에서만 푸시 토큰 획득 가능
    if (!Device.isDevice) {
      return null;
    }

    // 권한 확인 및 요청
    const permissionStatus = await requestPermissions();

    if (permissionStatus !== 'granted') {
      return null;
    }

    // Android 채널 설정
    if (Platform.OS === 'android') {
      await setupAllNotificationChannels();
    }

    // Expo Push Token 획득
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '1d17c608-a305-47a2-9b5c-659fcff4ff7c', // app.json의 projectId
    });

    return {
      type: 'expo',
      data: tokenData.data,
    };
  } catch {
    return null;
  }
}

/**
 * 알림 트리거 생성 헬퍼
 */
function createTrigger(
  trigger: NotificationTrigger,
): Notifications.NotificationTriggerInput {
  switch (trigger.type) {
    case 'time':
      // 특정 시간 후 알림
      return {
        type: 'timeInterval',
        seconds: trigger.seconds || 0,
      } as Notifications.TimeIntervalTriggerInput;

    case 'interval':
      // 반복 알림
      return {
        type: 'timeInterval',
        seconds: trigger.seconds || 60,
        repeats: trigger.repeats ?? false,
      } as Notifications.TimeIntervalTriggerInput;

    case 'daily':
      // 매일 반복 알림
      return {
        type: 'calendar',
        hour: trigger.hour || 9,
        minute: trigger.minute || 0,
        repeats: true,
      } as Notifications.CalendarTriggerInput;

    case 'weekly':
      // 주간 반복 알림
      return {
        type: 'calendar',
        weekday: trigger.weekday || 1, // 1=일요일
        hour: trigger.hour || 9,
        minute: trigger.minute || 0,
        repeats: true,
      } as Notifications.CalendarTriggerInput;

    case 'calendar':
      // 캘린더 기반 알림
      return {
        type: 'calendar',
        year: trigger.year,
        month: trigger.month,
        day: trigger.day,
        hour: trigger.hour || 9,
        minute: trigger.minute || 0,
        repeats: trigger.repeats ?? false,
      } as Notifications.CalendarTriggerInput;

    default:
      return {
        type: 'timeInterval',
        seconds: 0,
      } as Notifications.TimeIntervalTriggerInput;
  }
}

/**
 * 로컬 알림 스케줄링
 */
export async function scheduleLocalNotification(
  options: NotificationOptions,
): Promise<string | null> {
  try {
    const { content, trigger, category, priority, channelId } = options;

    // Android 채널 ID 결정
    let finalChannelId = channelId;

    if (Platform.OS === 'android' && !finalChannelId && category) {
      finalChannelId = CATEGORY_TO_CHANNEL[category];
    }

    // 알림 콘텐츠 구성
    const notificationContent: Notifications.NotificationContentInput = {
      title: content.title,
      body: content.body,
      data: content.data || {},
      sound: content.sound ?? DEFAULT_NOTIFICATION_CONFIG.sound,
      badge: content.badge,
      categoryIdentifier: content.categoryIdentifier,
    };

    // Android 전용 설정
    if (Platform.OS === 'android') {
      notificationContent.sound = 'default';
      notificationContent.priority = priority
        ? PRIORITY_MAPPING[priority].toString()
        : PRIORITY_MAPPING[DEFAULT_NOTIFICATION_CONFIG.priority].toString();
    }

    // 트리거 생성
    const notificationTrigger = createTrigger(trigger);

    // 알림 스케줄
    const identifier = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: notificationTrigger,
    });

    return identifier;
  } catch {
    return null;
  }
}

/**
 * 즉시 알림 표시
 */
export async function presentNotification(
  content: NotificationContent,
): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data || {},
        sound: content.sound ?? true,
        badge: content.badge,
      },
      trigger: null, // 즉시 표시
    });

    return identifier;
  } catch {
    return null;
  }
}

/**
 * 특정 알림 취소
 */
export async function cancelNotification(identifier: string): Promise<boolean> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    return true;
  } catch {
    return false;
  }
}

/**
 * 모든 알림 취소
 */
export async function cancelAllNotifications(): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch {
    return false;
  }
}

/**
 * 예약된 모든 알림 조회
 */
export async function getAllScheduledNotifications(): Promise<
  ScheduledNotification[]
> {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();

    return notifications.map((notification) => ({
      identifier: notification.identifier,
      content: {
        title: notification.content.title || '',
        body: notification.content.body || '',
        data: notification.content.data,
        sound: notification.content.sound
          ? String(notification.content.sound)
          : undefined,
        badge: notification.content.badge ?? undefined,
      },
      trigger: notification.trigger,
    }));
  } catch {
    return [];
  }
}

/**
 * Android 알림 채널 설정
 */
export async function setupNotificationChannel(
  channelId: string,
  channelConfig: {
    name: string;
    description: string;
    importance: Notifications.AndroidImportance;
    sound?: string;
    vibrate?: boolean;
    enableLights?: boolean;
    lightColor?: string;
  },
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: channelConfig.name,
      description: channelConfig.description,
      importance: channelConfig.importance,
      sound: channelConfig.sound,
      vibrationPattern: channelConfig.vibrate ? [0, 250, 250, 250] : undefined,
      enableLights: channelConfig.enableLights,
      lightColor: channelConfig.lightColor,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 모든 알림 채널 설정
 */
export async function setupAllNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // 루틴 인증 요청 알림 채널 설정
    await setupNotificationChannel(
      NOTIFICATION_CHANNELS.ROUTINE.id,
      NOTIFICATION_CHANNELS.ROUTINE,
    );
  } catch {
    // ignore
  }
}

/**
 * 알림 배지 카운트 설정 (iOS)
 */
export async function setBadgeCount(count: number): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    await Notifications.setBadgeCountAsync(count);
    return true;
  } catch {
    return false;
  }
}

/**
 * 알림 배지 카운트 조회 (iOS)
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS !== 'ios') {
    return 0;
  }

  try {
    return await Notifications.getBadgeCountAsync();
  } catch {
    return 0;
  }
}
