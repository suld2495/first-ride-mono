import { fetchRequestDetail } from '@repo/shared/api/request.api';
import type * as Notifications from 'expo-notifications';

import {
  DEEP_LINK_SCREENS,
  NOTIFICATION_CATEGORY_TO_SCREEN,
  PUSH_NOTIFICATION_ROUTES,
} from '@/constants/NOTIFICATIONS';
import { buildRoutineSharePath } from '@/share/routine-share';
import type {
  NotificationDeepLinkData,
  PushNotificationType,
} from '@/types/notification-types';

const ROUTINE_MATE_ASSIGNED_TYPE: PushNotificationType =
  'routine-mate-assigned';
const URL_BASE = 'https://first-ride.local';

const getPositiveInteger = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return undefined;
  }

  return value;
};

const getNotificationScreen = (
  data: NotificationDeepLinkData,
  fallback: string,
): string =>
  typeof data.screen === 'string' && data.screen.length > 0
    ? data.screen
    : fallback;

const addRoutineDetailParams = (
  path: string,
  ownerId: string,
  routineId: number,
): string => {
  const url = new URL(path, URL_BASE);
  url.searchParams.set('ownerId', ownerId);
  url.searchParams.set('routineId', String(routineId));

  return `${url.pathname}${url.search}${url.hash}`;
};

export const getRoutineMateAssignedPath = (
  data: NotificationDeepLinkData | undefined,
): string | undefined => {
  if (!data || data.type !== ROUTINE_MATE_ASSIGNED_TYPE) {
    return undefined;
  }

  const routineId = getPositiveInteger(data.routineId);
  const ownerId = typeof data.ownerId === 'string' ? data.ownerId.trim() : '';

  if (!routineId || !ownerId) {
    return undefined;
  }

  return addRoutineDetailParams(
    getNotificationScreen(data, DEEP_LINK_SCREENS.ROUTINE_DETAIL),
    ownerId,
    routineId,
  );
};

export const getRoutineSharePath = (
  data: NotificationDeepLinkData | undefined,
): string | undefined => {
  if (
    !data ||
    typeof data.routineId !== 'number' ||
    !Number.isInteger(data.routineId) ||
    data.routineId <= 0 ||
    typeof data.shareSessionId !== 'string' ||
    data.shareSessionId.length === 0
  ) {
    return undefined;
  }

  return buildRoutineSharePath(data.routineId, data.shareSessionId);
};

export function getDeepLinkPath(
  data: NotificationDeepLinkData | undefined,
): string {
  if (!data) {
    return DEEP_LINK_SCREENS.ROUTINE;
  }

  if (data.type === ROUTINE_MATE_ASSIGNED_TYPE) {
    return getRoutineMateAssignedPath(data) ?? DEEP_LINK_SCREENS.ROUTINE;
  }

  if (data.screen && typeof data.screen === 'string') {
    return data.screen;
  }

  const routineSharePath = getRoutineSharePath(data);

  if (routineSharePath) {
    return routineSharePath;
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
    kind: 'navigate',
    path: '/modal?type=routine-proof-detail',
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

const normalizeNotificationType = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value.replace(/[\s-]/g, '_').toUpperCase();
};

export const isLevelUpStatusNotification = (
  notification: Notifications.Notification,
): boolean => {
  const data = extractDeepLinkData(notification);
  const notificationTypes = [
    data?.type,
    data?.notificationType,
    data?.subtype,
    data?.notificationSubtype,
  ];

  return notificationTypes.some(
    (value) => normalizeNotificationType(value) === 'LEVEL_UP',
  );
};
