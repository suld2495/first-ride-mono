describe('Firebase Analytics collection', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('지원되는 네이티브 환경에서 수집 설정을 SDK에 전달한다', async () => {
    const firebaseAnalytics = {
      setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
    };
    const {
      setFirebaseAnalyticsEnabled,
    } = require('@/utils/firebase-analytics');

    await setFirebaseAnalyticsEnabled(true, {
      loadAnalytics: () => firebaseAnalytics,
      platform: 'ios',
    });

    expect(
      firebaseAnalytics.setAnalyticsCollectionEnabled,
    ).toHaveBeenCalledWith(true);
  });

  it('웹 환경에서는 네이티브 SDK를 불러오지 않는다', async () => {
    const loadAnalytics = jest.fn();
    const {
      setFirebaseAnalyticsEnabled,
    } = require('@/utils/firebase-analytics');

    await expect(
      setFirebaseAnalyticsEnabled(true, {
        loadAnalytics,
        platform: 'web',
      }),
    ).resolves.toBeUndefined();

    expect(loadAnalytics).not.toHaveBeenCalled();
  });

  it('SDK 오류를 호출자에게 전달한다', async () => {
    const firebaseError = new Error('firebase unavailable');
    const firebaseAnalytics = {
      setAnalyticsCollectionEnabled: jest.fn(() =>
        Promise.reject(firebaseError),
      ),
    };
    const {
      setFirebaseAnalyticsEnabled,
    } = require('@/utils/firebase-analytics');

    await expect(
      setFirebaseAnalyticsEnabled(true, {
        loadAnalytics: () => firebaseAnalytics,
        platform: 'android',
      }),
    ).rejects.toThrow('firebase unavailable');
  });
});
