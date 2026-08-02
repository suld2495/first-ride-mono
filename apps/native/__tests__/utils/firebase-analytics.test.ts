jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const getMockedStorage = () =>
  jest.requireMock('@react-native-async-storage/async-storage') as {
    getItem: jest.Mock;
    setItem: jest.Mock;
  };

describe('Firebase Analytics collection', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('저장된 선택이 없는 신규 설치에서는 기본값을 켜짐으로 반환한다', async () => {
    const mockedStorage = getMockedStorage();
    const {
      getFirebaseAnalyticsEnabled,
    } = require('@/utils/firebase-analytics');

    mockedStorage.getItem.mockResolvedValue(null);

    await expect(getFirebaseAnalyticsEnabled()).resolves.toBe(true);
  });

  it('이전 통합 설정에서 분석을 거부한 사용자는 Firebase도 꺼짐으로 이어받는다', async () => {
    const mockedStorage = getMockedStorage();
    const {
      getFirebaseAnalyticsEnabled,
    } = require('@/utils/firebase-analytics');

    mockedStorage.getItem.mockImplementation((key: string) =>
      Promise.resolve(
        key === 'clarityAnalyticsCollectionPreference:v1' ? 'disabled' : null,
      ),
    );

    await expect(getFirebaseAnalyticsEnabled()).resolves.toBe(false);
  });

  it('저장소를 읽지 못하면 안전하게 수집하지 않는다', async () => {
    const mockedStorage = getMockedStorage();
    const {
      getFirebaseAnalyticsEnabled,
    } = require('@/utils/firebase-analytics');

    mockedStorage.getItem.mockRejectedValue(new Error('storage unavailable'));

    await expect(getFirebaseAnalyticsEnabled()).resolves.toBe(false);
  });

  it('앱 시작 시 저장된 Firebase 설정을 SDK에 적용한다', async () => {
    const mockedStorage = getMockedStorage();
    const firebaseAnalytics = {
      setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
    };
    const {
      initializeFirebaseAnalyticsWithStoredPreference,
    } = require('@/utils/firebase-analytics');

    mockedStorage.getItem.mockResolvedValue(null);

    await initializeFirebaseAnalyticsWithStoredPreference({
      loadAnalytics: () => firebaseAnalytics,
      platform: 'ios',
    });

    expect(
      firebaseAnalytics.setAnalyticsCollectionEnabled,
    ).toHaveBeenCalledWith(true);
  });

  it('Firebase 토글을 끄면 별도 선택을 저장하고 SDK 수집을 중지한다', async () => {
    const mockedStorage = getMockedStorage();
    const firebaseAnalytics = {
      setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
    };
    const {
      FIREBASE_ANALYTICS_PREFERENCE_KEY,
      setFirebaseAnalyticsEnabled,
    } = require('@/utils/firebase-analytics');

    await setFirebaseAnalyticsEnabled(false, {
      loadAnalytics: () => firebaseAnalytics,
      platform: 'ios',
    });

    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      FIREBASE_ANALYTICS_PREFERENCE_KEY,
      'disabled',
    );
    expect(
      firebaseAnalytics.setAnalyticsCollectionEnabled,
    ).toHaveBeenCalledWith(false);
  });

  it('웹 환경에서도 선택은 저장하되 네이티브 SDK는 불러오지 않는다', async () => {
    const mockedStorage = getMockedStorage();
    const loadAnalytics = jest.fn();
    const {
      FIREBASE_ANALYTICS_PREFERENCE_KEY,
      setFirebaseAnalyticsEnabled,
    } = require('@/utils/firebase-analytics');

    await expect(
      setFirebaseAnalyticsEnabled(true, {
        loadAnalytics,
        platform: 'web',
      }),
    ).resolves.toBeUndefined();

    expect(loadAnalytics).not.toHaveBeenCalled();
    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      FIREBASE_ANALYTICS_PREFERENCE_KEY,
      'enabled',
    );
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
