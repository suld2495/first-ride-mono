import http from './client';

export const NOTIFICATION_SUBTYPES = [
  'ROUTINE_CONFIRM_REQUEST',
  'ROUTINE_CONFIRM_APPROVED',
  'ROUTINE_CONFIRM_REJECTED',
  'ROUTINE_CHANGE_REQUEST',
  'ROUTINE_CHANGE_APPROVED',
  'ROUTINE_CHANGE_REJECTED',
  'DAILY_ROUTINE_REMINDER',
  'LEVEL_UP',
  'FRIEND_REQUEST',
  'FRIEND_ACCEPTED',
  'QUEST_COMPLETE',
  'QUEST_REWARD',
  'SYSTEM',
  'RANKING',
] as const;

export type NotificationSubtype = (typeof NOTIFICATION_SUBTYPES)[number];

export type NotificationSettings = {
  allEnabled: boolean;
  subtypes: Record<NotificationSubtype, boolean>;
};

type NotificationSettingsResponse = Partial<{
  allEnabled: boolean;
  settings: Partial<Record<NotificationSubtype, boolean>>;
  subtypes: Partial<Record<NotificationSubtype, boolean>>;
}>;

export type UpdateNotificationSettingsRequest = Partial<{
  allEnabled: boolean;
  subtypes: Partial<Record<NotificationSubtype, boolean>>;
}>;

type NotificationSettingsUpdatePayload = Partial<{
  allEnabled: boolean;
  settings: Partial<Record<NotificationSubtype, boolean>>;
}>;

const baseURL = '/notifications/settings';

const normalizeNotificationSettings = (
  settings: NotificationSettingsResponse,
): NotificationSettings => {
  const responseSubtypeSettings = settings.settings ?? settings.subtypes ?? {};
  const subtypeSettings = new Map(
    Object.entries(responseSubtypeSettings) as Array<
      [NotificationSubtype, boolean]
    >,
  );

  return {
    allEnabled: settings.allEnabled ?? true,
    subtypes: Object.fromEntries(
      NOTIFICATION_SUBTYPES.map((subtype) => [
        subtype,
        subtypeSettings.get(subtype) ?? true,
      ]),
    ) as Record<NotificationSubtype, boolean>,
  };
};

const toNotificationSettingsUpdatePayload = (
  form: UpdateNotificationSettingsRequest,
): NotificationSettingsUpdatePayload => ({
  allEnabled: form.allEnabled,
  settings: form.subtypes,
});

export const fetchNotificationSettings =
  async (): Promise<NotificationSettings> => {
    try {
      const settings = await http.get<NotificationSettingsResponse, void>(
        baseURL,
      );

      return normalizeNotificationSettings(settings);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('알림 설정을 불러오지 못했습니다.');
    }
  };

export const updateNotificationSettings = async (
  form: UpdateNotificationSettingsRequest,
): Promise<NotificationSettings> => {
  try {
    const payload = toNotificationSettingsUpdatePayload(form);
    const settings = await http.patch<
      NotificationSettingsResponse,
      NotificationSettingsUpdatePayload
    >(baseURL, payload);
    return normalizeNotificationSettings(settings);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('알림 설정을 변경하지 못했습니다.');
  }
};
