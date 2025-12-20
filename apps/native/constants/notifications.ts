import { AndroidImportance } from 'expo-notifications';

import {
  NotificationCategory,
  NotificationPriority,
} from '@/types/notification.types';

/**
 * Android 알림 채널 설정
 */
export const NOTIFICATION_CHANNELS = {
  ROUTINE: {
    id: 'routine-channel',
    name: '인증 요청 알림',
    description: '메이트의 루틴 인증 요청 알림을 받습니다',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibrate: true,
    enableLights: true,
    lightColor: '#7edcd5',
  },
} as const;

/**
 * 알림 카테고리별 채널 ID 매핑
 */
export const CATEGORY_TO_CHANNEL: Record<NotificationCategory, string> = {
  routine: NOTIFICATION_CHANNELS.ROUTINE.id,
};

/**
 * 알림 우선순위 매핑 (커스텀 → Expo)
 */
export const PRIORITY_MAPPING: Record<NotificationPriority, AndroidImportance> =
  {
    min: AndroidImportance.MIN,
    low: AndroidImportance.LOW,
    default: AndroidImportance.DEFAULT,
    high: AndroidImportance.HIGH,
    max: AndroidImportance.MAX,
  };

/**
 * 알림 카테고리 식별자 (iOS)
 */
export const NOTIFICATION_CATEGORY_IDENTIFIERS = {
  ROUTINE: 'routine-category',
} as const;

/**
 * 알림 액션 (iOS)
 */
export const NOTIFICATION_ACTIONS = {
  VERIFY_REQUEST: 'VERIFY_REQUEST',
  VIEW_DETAILS: 'VIEW_DETAILS',
  DISMISS: 'DISMISS',
} as const;

/**
 * 기본 알림 설정
 */
export const DEFAULT_NOTIFICATION_CONFIG = {
  sound: true,
  badge: true,
  vibrate: true,
  priority: 'high' as NotificationPriority,
} as const;

/**
 * 스누즈 시간 옵션 (초)
 */
export const SNOOZE_OPTIONS = {
  FIVE_MINUTES: 5 * 60,
  TEN_MINUTES: 10 * 60,
  THIRTY_MINUTES: 30 * 60,
  ONE_HOUR: 60 * 60,
} as const;

/**
 * 알림 데이터 키
 */
export const NOTIFICATION_DATA_KEYS = {
  CATEGORY: 'category',
  ROUTINE_ID: 'routineId',
  SCREEN: 'screen',
  ACTION: 'action',
} as const;

/**
 * 딥링크 가능한 화면 목록
 */
export const DEEP_LINK_SCREENS = {
  ROUTINE: '/(tabs)/(afterLogin)/(routine)',
  FRIEND: '/(tabs)/(afterLogin)/(friend)',
  QUEST: '/(tabs)/(afterLogin)/(quest)',
  MY_INFO: '/(tabs)/(afterLogin)/my-info',
} as const;

export type DeepLinkScreen =
  (typeof DEEP_LINK_SCREENS)[keyof typeof DEEP_LINK_SCREENS];

/**
 * 알림 타입별 기본 딥링크 화면 매핑
 */
export const NOTIFICATION_TYPE_TO_SCREEN: Record<
  NotificationCategory,
  DeepLinkScreen
> = {
  routine: DEEP_LINK_SCREENS.ROUTINE,
};
