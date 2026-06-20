import type { Href } from 'expo-router';

import { pushAfterProtectedRoutesReady } from '@/utils/protected-route-navigation';

describe('pushAfterProtectedRoutesReady', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('보호 라우트가 갱신될 다음 tick에 이동한다', async () => {
    jest.useFakeTimers();

    const router = { push: jest.fn() };
    const href = '/(tabs)/(afterLogin)/(routine)' as Href;
    const navigation = pushAfterProtectedRoutesReady(router, href);

    expect(router.push).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();
    await navigation;

    expect(router.push).toHaveBeenCalledWith(href);
  });
});
