import axiosInstance from '@repo/shared/api';
import {
  fetchNotificationSettings,
  NOTIFICATION_SUBTYPES,
  updateNotificationSettings,
} from '@repo/shared/api/notification-settings.api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;
const allSubtypesOn = Object.fromEntries(
  NOTIFICATION_SUBTYPES.map((subtype) => [subtype, true]),
);

describe('notification-settings.api', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('공통 응답 템플릿의 data 하위 알림 설정을 반환한다', async () => {
    mockAxios.onGet('/notifications/settings').reply(200, {
      data: {
        allEnabled: true,
        settings: {
          FRIEND_REQUEST: true,
          QUEST_COMPLETE: false,
        },
      },
    });

    await expect(fetchNotificationSettings()).resolves.toEqual({
      allEnabled: true,
      subtypes: {
        ...allSubtypesOn,
        FRIEND_REQUEST: true,
        QUEST_COMPLETE: false,
      },
    });
  });

  it('변경할 알림 설정만 PATCH body로 전송하고 응답 설정을 반환한다', async () => {
    mockAxios.onPatch('/notifications/settings').reply((config) => {
      expect(JSON.parse(config.data ?? '{}')).toEqual({
        settings: {
          FRIEND_REQUEST: false,
        },
      });

      return [
        200,
        {
          data: {
            allEnabled: true,
            settings: {
              FRIEND_REQUEST: false,
              QUEST_COMPLETE: true,
            },
          },
        },
      ];
    });

    await expect(
      updateNotificationSettings({
        subtypes: {
          FRIEND_REQUEST: false,
        },
      }),
    ).resolves.toEqual({
      allEnabled: true,
      subtypes: {
        ...allSubtypesOn,
        FRIEND_REQUEST: false,
        QUEST_COMPLETE: true,
      },
    });
  });

  it('응답에 누락된 subtype은 기본 ON으로 보정한다', async () => {
    mockAxios.onGet('/notifications/settings').reply(200, {
      data: {
        allEnabled: true,
      },
    });

    await expect(fetchNotificationSettings()).resolves.toMatchObject({
      allEnabled: true,
      subtypes: {
        ROUTINE_CONFIRM_REQUEST: true,
        ROUTINE_CONFIRM_APPROVED: true,
        ROUTINE_CONFIRM_REJECTED: true,
        ROUTINE_CHANGE_REQUEST: true,
        ROUTINE_CHANGE_APPROVED: true,
        ROUTINE_CHANGE_REJECTED: true,
        DAILY_ROUTINE_REMINDER: true,
        LEVEL_UP: true,
        FRIEND_REQUEST: true,
        FRIEND_ACCEPTED: true,
        QUEST_COMPLETE: true,
        QUEST_REWARD: true,
        SYSTEM: true,
        RANKING: true,
      },
    });
  });
});
