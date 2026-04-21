import * as requestApi from '@repo/shared/api/request.api';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { DEEP_LINK_SCREENS } from '../../constants/NOTIFICATIONS';
import type { NotificationDeepLinkData } from '../../types/notification-types';
import {
  clearBadgeCount,
  getBadgeCount,
  getDeepLinkPath,
  setBadgeCount,
  syncBadgeCountFromNotification,
  syncBadgeCountWithReceivedRequests,
} from '../../utils/notifications';

const mockNotifications = jest.mocked(Notifications);
const originalPlatform = Platform.OS;

function setPlatform(os: 'ios' | 'android') {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => os,
  });
}

afterEach(() => {
  jest.clearAllMocks();
  setPlatform(originalPlatform as 'ios' | 'android');
});

describe('badge helpers', () => {
  it('받은 인증 요청 목록 개수로 badge count를 동기화한다', async () => {
    jest
      .spyOn(requestApi, 'fetchReceivedRequests')
      .mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }] as Awaited<
        ReturnType<typeof requestApi.fetchReceivedRequests>
      >);
    mockNotifications.setBadgeCountAsync.mockResolvedValue(true);

    await expect(syncBadgeCountWithReceivedRequests()).resolves.toBe(3);

    expect(requestApi.fetchReceivedRequests).toHaveBeenCalledTimes(1);
    expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(3);
  });

  it('android에서도 badge count 설정을 시도한다', async () => {
    setPlatform('android');
    mockNotifications.setBadgeCountAsync.mockResolvedValue(true);

    await expect(setBadgeCount(3)).resolves.toBe(true);

    expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(3);
  });

  it('android에서도 badge count 조회를 시도한다', async () => {
    setPlatform('android');
    mockNotifications.getBadgeCountAsync.mockResolvedValue(7);

    await expect(getBadgeCount()).resolves.toBe(7);

    expect(mockNotifications.getBadgeCountAsync).toHaveBeenCalledTimes(1);
  });

  it('알림 payload에 badge가 있으면 해당 값으로 동기화한다', async () => {
    mockNotifications.setBadgeCountAsync.mockResolvedValue(true);

    const notification = {
      request: {
        content: {
          badge: 5,
        },
      },
    } as Notifications.Notification;

    await expect(syncBadgeCountFromNotification(notification)).resolves.toBe(5);

    expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(5);
  });

  it('알림 payload에 badge가 없으면 현재 badge에서 1 증가시킨다', async () => {
    mockNotifications.getBadgeCountAsync.mockResolvedValue(2);
    mockNotifications.setBadgeCountAsync.mockResolvedValue(true);

    const notification = {
      request: {
        content: {},
      },
    } as Notifications.Notification;

    await expect(syncBadgeCountFromNotification(notification)).resolves.toBe(3);

    expect(mockNotifications.getBadgeCountAsync).toHaveBeenCalledTimes(1);
    expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(3);
  });

  it('clearBadgeCount는 0으로 초기화한다', async () => {
    mockNotifications.setBadgeCountAsync.mockResolvedValue(true);

    await expect(clearBadgeCount()).resolves.toBe(true);

    expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
  });
});

describe('getDeepLinkPath', () => {
  describe('data가 없는 경우', () => {
    it('기본 루틴 화면 경로를 반환한다', () => {
      expect(getDeepLinkPath(undefined)).toBe(DEEP_LINK_SCREENS.ROUTINE);
    });
  });

  describe('screen이 직접 지정된 경우', () => {
    it('지정된 screen 경로를 반환한다', () => {
      const data: NotificationDeepLinkData = {
        screen: '/custom/path',
      };
      expect(getDeepLinkPath(data)).toBe('/custom/path');
    });

    it('type보다 screen이 우선순위가 높다', () => {
      const data: NotificationDeepLinkData = {
        screen: '/custom/path',
        type: 'routine-request',
      };
      expect(getDeepLinkPath(data)).toBe('/custom/path');
    });
  });

  describe('type으로 푸시 알림 타입별 화면 매핑', () => {
    it('routine-request 타입은 request-detail 모달로 이동한다', () => {
      const data: NotificationDeepLinkData = {
        type: 'routine-request',
        requestId: 123,
      };
      expect(getDeepLinkPath(data)).toBe('/modal?type=request-detail');
    });

    it('routine-approved 타입은 루틴 화면으로 이동한다', () => {
      const data: NotificationDeepLinkData = {
        type: 'routine-approved',
        routineId: 456,
      };
      expect(getDeepLinkPath(data)).toBe(DEEP_LINK_SCREENS.ROUTINE);
    });

    it('routine-rejected 타입은 루틴 화면으로 이동한다', () => {
      const data: NotificationDeepLinkData = {
        type: 'routine-rejected',
        routineId: 789,
      };
      expect(getDeepLinkPath(data)).toBe(DEEP_LINK_SCREENS.ROUTINE);
    });

    it('friend-request 타입은 friend-request-list 모달로 이동한다', () => {
      const data: NotificationDeepLinkData = {
        type: 'friend-request',
      };
      expect(getDeepLinkPath(data)).toBe('/modal?type=friend-request-list');
    });

    it('friend-accepted 타입은 친구 목록 화면으로 이동한다', () => {
      const data: NotificationDeepLinkData = {
        type: 'friend-accepted',
      };
      expect(getDeepLinkPath(data)).toBe(DEEP_LINK_SCREENS.FRIEND);
    });
  });

  describe('category로 기본 화면 매핑', () => {
    it('routine 카테고리는 루틴 화면으로 이동한다', () => {
      const data: NotificationDeepLinkData = {
        category: 'routine',
      };
      expect(getDeepLinkPath(data)).toBe(DEEP_LINK_SCREENS.ROUTINE);
    });

    it('friend 카테고리는 친구 화면으로 이동한다', () => {
      const data: NotificationDeepLinkData = {
        category: 'friend',
      };
      expect(getDeepLinkPath(data)).toBe(DEEP_LINK_SCREENS.FRIEND);
    });

    it('type이 category보다 우선순위가 높다', () => {
      const data: NotificationDeepLinkData = {
        type: 'friend-request',
        category: 'routine',
      };
      expect(getDeepLinkPath(data)).toBe('/modal?type=friend-request-list');
    });
  });

  describe('기본값 반환', () => {
    it('빈 객체인 경우 기본 루틴 화면을 반환한다', () => {
      const data: NotificationDeepLinkData = {};
      expect(getDeepLinkPath(data)).toBe(DEEP_LINK_SCREENS.ROUTINE);
    });
  });
});
