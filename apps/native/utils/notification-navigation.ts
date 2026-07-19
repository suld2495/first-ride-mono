import { fetchRequestDetail } from '@repo/shared/api/request.api';
import type * as Notifications from 'expo-notifications';

import {
  DEEP_LINK_SCREENS,
  NOTIFICATION_CATEGORY_TO_SCREEN,
  PUSH_NOTIFICATION_ROUTES,
} from '@/constants/NOTIFICATIONS';
import type { NotificationDeepLinkData } from '@/types/notification-types';

export function getDeepLinkPath(
  data: NotificationDeepLinkData | undefined,
): string {
  if (!data) {
    return DEEP_LINK_SCREENS.ROUTINE;
  }

  if (data.screen && typeof data.screen === 'string') {
    return data.screen;
  }

  if (data.type && data.type in PUSH_NOTIFICATION_ROUTES) {
    return PUSH_NOTIFICATION_ROUTES[data.type];
  }

  if (data.category && data.category in NOTIFICATION_CATEGORY_TO_SCREEN) {
    return NOTIFICATION_CATEGORY_TO_SCREEN[data.category];
  }

  return DEEP_LINK_SCREENS.ROUTINE;
}

export type NotificationNavigationIntent =
  | {
      kind: 'navigate';
      path: string;
    }
  | {
      kind: 'toast';
      message: string;
    };

export function getCompletedRoutineRequestToastMessage(): string {
  return '이미 완료된 인증 요청입니다.';
}

export async function getNotificationNavigationIntent(
  data: NotificationDeepLinkData | undefined,
): Promise<NotificationNavigationIntent> {
  const path = getDeepLinkPath(data);

  if (data?.type !== 'routine-request' || !data.requestId) {
    return {
      kind: 'navigate',
      path,
    };
  }

  const detail = await fetchRequestDetail(data.requestId);

  if (detail.checkStatus === 'WAIT') {
    return {
      kind: 'navigate',
      path,
    };
  }

  return {
    kind: 'toast',
    message: getCompletedRoutineRequestToastMessage(),
  };
}

export function extractDeepLinkData(
  notification: Notifications.Notification,
): NotificationDeepLinkData | undefined {
  const { data } = notification.request.content;

  if (data && typeof data === 'object') {
    return data as NotificationDeepLinkData;
  }

  return undefined;
}
