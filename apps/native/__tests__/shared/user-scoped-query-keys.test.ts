import { friendRequestKey } from '@repo/shared/types/query-keys/friend';
import { notificationSettingsKeys } from '@repo/shared/types/query-keys/notification-settings';
import { questKeys, rewardKeys } from '@repo/shared/types/query-keys/quest';
import { statKey } from '@repo/shared/types/query-keys/stat';

describe('사용자별 private query key', () => {
  it.each([
    [
      '내 통계',
      statKey.me('account-a'),
      statKey.me('account-b'),
      ['stat', 'account-a', 'me'],
    ],
    [
      '알림 설정',
      notificationSettingsKeys.detail('account-a'),
      notificationSettingsKeys.detail('account-b'),
      ['notification-settings', 'account-a', 'detail'],
    ],
    [
      '친구 요청',
      friendRequestKey.list('account-a', 1),
      friendRequestKey.list('account-b', 1),
      ['friend-request', 'account-a', 1],
    ],
    [
      '퀘스트 목록',
      questKeys.list('account-a', { status: 'IN_PROGRESS' }),
      questKeys.list('account-b', { status: 'IN_PROGRESS' }),
      ['quest', 'account-a', 'list', 'IN_PROGRESS', 'ALL', 'ALL'],
    ],
    [
      '퀘스트 상세',
      questKeys.detail('account-a', 7),
      questKeys.detail('account-b', 7),
      ['quest', 'account-a', 'detail', 7],
    ],
    [
      '보상 목록',
      rewardKeys.list('account-a', 'ALL'),
      rewardKeys.list('account-b', 'ALL'),
      ['reward', 'account-a', 'list', 'ALL'],
    ],
    [
      '보상 상세',
      rewardKeys.detail('account-a', 3),
      rewardKeys.detail('account-b', 3),
      ['reward', 'account-a', 'detail', 3],
    ],
  ])(
    '%s 캐시는 userId에 따라 분리된다',
    (_name, accountAKey, accountBKey, expectedAccountAKey) => {
      expect(accountAKey).toEqual(expectedAccountAKey);
      expect(accountAKey).not.toEqual(accountBKey);
      expect(accountBKey).toContain('account-b');
    },
  );
});
