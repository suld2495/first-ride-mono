import { DEEP_LINK_SCREENS } from '../../constants/notifications';
import { NotificationDeepLinkData } from '../../types/notification.types';
import { getDeepLinkPath } from '../../utils/notifications';

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
