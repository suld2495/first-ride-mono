import * as Notifications from 'expo-notifications';

/**
 * 알림 콘텐츠 타입
 */
export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string | boolean;
  badge?: number;
  categoryIdentifier?: string;
}

/**
 * 알림 트리거 타입 (로컬 알림용)
 */
export interface NotificationTrigger {
  type: 'time' | 'interval' | 'daily' | 'weekly' | 'calendar';
  // 시간 기반
  seconds?: number;
  // 반복 설정
  repeats?: boolean;
  // 일일 반복 (시간, 분)
  hour?: number;
  minute?: number;
  // 주간 반복 (요일: 1=일요일, 7=토요일)
  weekday?: number;
  // 캘린더 기반
  year?: number;
  month?: number;
  day?: number;
}

/**
 * 알림 권한 상태
 */
export type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined';

/**
 * 푸시 알림 토큰
 */
export interface PushNotificationToken {
  type: 'expo' | 'ios' | 'android';
  data: string;
}

/**
 * 알림 응답 (사용자가 알림을 클릭했을 때)
 */
export interface NotificationResponse {
  notification: Notifications.Notification;
  actionIdentifier: string;
  userText?: string;
}

/**
 * 스케줄된 알림 정보
 */
export interface ScheduledNotification {
  identifier: string;
  content: NotificationContent;
  trigger: Notifications.NotificationTrigger;
}

/**
 * 알림 카테고리 타입
 */
export type NotificationCategory = 'routine';

/**
 * 알림 우선순위 (Android)
 */
export type NotificationPriority = 'min' | 'low' | 'default' | 'high' | 'max';

/**
 * 알림 설정 옵션
 */
export interface NotificationOptions {
  content: NotificationContent;
  trigger: NotificationTrigger;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  channelId?: string;
}

/**
 * 알림 핸들러 타입
 */
export interface NotificationHandlers {
  onReceived?: (notification: Notifications.Notification) => void;
  onResponseReceived?: (response: NotificationResponse) => void;
}

/**
 * 알림 딥링크 데이터
 * 서버에서 푸시 알림에 포함하여 전송하는 데이터 구조
 */
export interface NotificationDeepLinkData {
  /** 이동할 화면 경로 */
  screen?: string;
  /** 알림 카테고리 */
  category?: 'routine';
  /** 관련 루틴 ID */
  routineId?: number;
  /** 추가 액션 */
  action?: string;
  /** 기타 데이터 */
  [key: string]: unknown;
}
