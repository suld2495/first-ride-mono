interface ClaritySdkMock {
  LogLevel: {
    None: 'None';
    Verbose: 'Verbose';
  };
  initialize: jest.Mock;
  consent: jest.Mock;
  pause: jest.Mock;
  resume: jest.Mock;
}

const createSdkMock = (): ClaritySdkMock => ({
  LogLevel: {
    None: 'None',
    Verbose: 'Verbose',
  },
  initialize: jest.fn(),
  consent: jest.fn(() => Promise.resolve(true)),
  pause: jest.fn(() => Promise.resolve(true)),
  resume: jest.fn(() => Promise.resolve(true)),
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
}));

const getMockedStorage = () =>
  jest.requireMock('@react-native-async-storage/async-storage') as {
    getItem: jest.Mock;
    removeItem: jest.Mock;
    setItem: jest.Mock;
  };

describe('initializeClarity', () => {
  const originalClarityProjectId = process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID;
  });

  afterAll(() => {
    if (originalClarityProjectId) {
      process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID = originalClarityProjectId;
      return;
    }

    delete process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID;
  });

  it('네이티브 환경에서 프로젝트 ID로 Clarity를 한 번만 초기화한다', () => {
    const claritySdk = createSdkMock();
    const loadSdk = jest.fn(() => claritySdk);
    const { initializeClarity } = require('@/utils/clarity');

    expect(
      initializeClarity({
        isDevelopment: false,
        loadSdk,
        platform: 'ios',
        projectId: 'clarity-project-id',
      }),
    ).toBe(true);
    expect(
      initializeClarity({
        isDevelopment: false,
        loadSdk,
        platform: 'ios',
        projectId: 'clarity-project-id',
      }),
    ).toBe(false);
    expect(loadSdk).toHaveBeenCalledTimes(1);
    expect(claritySdk.initialize).toHaveBeenCalledWith('clarity-project-id', {
      logLevel: claritySdk.LogLevel.None,
    });
  });

  it('개발 빌드에서는 상세 로그를 활성화한다', () => {
    const claritySdk = createSdkMock();
    const { initializeClarity } = require('@/utils/clarity');

    initializeClarity({
      isDevelopment: true,
      loadSdk: () => claritySdk,
      platform: 'android',
      projectId: 'clarity-project-id',
    });

    expect(claritySdk.initialize).toHaveBeenCalledWith('clarity-project-id', {
      logLevel: claritySdk.LogLevel.Verbose,
    });
  });

  it('기본 설정에서는 환경변수와 설치된 SDK를 사용한다', () => {
    const claritySdk = createSdkMock();

    process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID = 'clarity-project-id';
    jest.doMock('@microsoft/react-native-clarity', () => claritySdk);

    const { initializeClarity } = require('@/utils/clarity');

    expect(initializeClarity()).toBe(true);
    expect(claritySdk.initialize).toHaveBeenCalledWith('clarity-project-id', {
      logLevel: claritySdk.LogLevel.Verbose,
    });
  });

  it.each([
    ['프로젝트 ID가 없을 때', { platform: 'ios', projectId: null }],
    ['웹 환경일 때', { platform: 'web', projectId: 'clarity-project-id' }],
  ])('%s SDK를 불러오지 않는다', (_, options) => {
    const loadSdk = jest.fn(() => createSdkMock());
    const { initializeClarity } = require('@/utils/clarity');

    expect(
      initializeClarity({
        isDevelopment: false,
        loadSdk,
        ...options,
      }),
    ).toBe(false);
    expect(loadSdk).not.toHaveBeenCalled();
  });

  it('저장된 동의가 없는 신규 설치에서는 Clarity를 초기화하지 않는다', async () => {
    const mockedStorage = getMockedStorage();

    mockedStorage.getItem.mockResolvedValue(null);
    const loadSdk = jest.fn(() => createSdkMock());
    const { initializeClarityWithStoredConsent } = require('@/utils/clarity');

    await expect(
      initializeClarityWithStoredConsent({
        isDevelopment: false,
        loadSdk,
        platform: 'ios',
        projectId: 'clarity-project-id',
      }),
    ).resolves.toBe(false);

    expect(loadSdk).not.toHaveBeenCalled();
  });

  it('분석 수집에 동의한 사용자에게만 Clarity를 시작한다', async () => {
    const mockedStorage = getMockedStorage();

    mockedStorage.getItem.mockResolvedValue('enabled');
    const claritySdk = createSdkMock();
    const { initializeClarityWithStoredConsent } = require('@/utils/clarity');

    await expect(
      initializeClarityWithStoredConsent({
        isDevelopment: false,
        loadSdk: () => claritySdk,
        platform: 'android',
        projectId: 'clarity-project-id',
      }),
    ).resolves.toBe(true);

    expect(claritySdk.initialize).toHaveBeenCalledTimes(1);
    expect(claritySdk.consent).toHaveBeenCalledWith(false, true);
  });

  it('분석 수집을 끄면 선택을 저장하고 현재 세션 수집을 중지한다', async () => {
    const mockedStorage = getMockedStorage();

    mockedStorage.getItem.mockResolvedValue('enabled');
    const claritySdk = createSdkMock();
    const {
      CLARITY_ANALYTICS_PREFERENCE_KEY,
      initializeClarityWithStoredConsent,
      setClarityAnalyticsEnabled,
    } = require('@/utils/clarity');

    await initializeClarityWithStoredConsent({
      isDevelopment: false,
      loadSdk: () => claritySdk,
      platform: 'ios',
      projectId: 'clarity-project-id',
    });
    await setClarityAnalyticsEnabled(false, {
      isDevelopment: false,
      loadSdk: () => claritySdk,
      platform: 'ios',
      projectId: 'clarity-project-id',
    });

    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      CLARITY_ANALYTICS_PREFERENCE_KEY,
      'disabled',
    );
    expect(claritySdk.consent).toHaveBeenLastCalledWith(false, false);
    expect(claritySdk.pause).toHaveBeenCalledTimes(1);
  });

  it('저장소를 읽지 못하면 안전하게 수집하지 않는다', async () => {
    const mockedStorage = getMockedStorage();

    mockedStorage.getItem.mockRejectedValue(new Error('storage unavailable'));
    const loadSdk = jest.fn(() => createSdkMock());
    const { initializeClarityWithStoredConsent } = require('@/utils/clarity');

    await expect(
      initializeClarityWithStoredConsent({
        loadSdk,
        platform: 'ios',
        projectId: 'clarity-project-id',
      }),
    ).resolves.toBe(false);
    expect(loadSdk).not.toHaveBeenCalled();
  });

  it('분석 수집 활성화 중 SDK 오류가 나면 저장값과 세션을 꺼짐으로 되돌린다', async () => {
    const mockedStorage = getMockedStorage();
    const claritySdk = createSdkMock();

    claritySdk.consent.mockRejectedValueOnce(new Error('consent failed'));
    const {
      CLARITY_ANALYTICS_PREFERENCE_KEY,
      setClarityAnalyticsEnabled,
    } = require('@/utils/clarity');

    await expect(
      setClarityAnalyticsEnabled(true, {
        isDevelopment: false,
        loadSdk: () => claritySdk,
        platform: 'ios',
        projectId: 'clarity-project-id',
      }),
    ).rejects.toThrow('consent failed');

    expect(mockedStorage.setItem).toHaveBeenNthCalledWith(
      1,
      CLARITY_ANALYTICS_PREFERENCE_KEY,
      'enabled',
    );
    expect(mockedStorage.setItem).toHaveBeenLastCalledWith(
      CLARITY_ANALYTICS_PREFERENCE_KEY,
      'disabled',
    );
    expect(claritySdk.consent).toHaveBeenLastCalledWith(false, false);
    expect(claritySdk.pause).toHaveBeenCalledTimes(1);
  });

  it('동의가 저장돼도 지원하지 않는 환경에서는 SDK를 시작하지 않는다', async () => {
    const mockedStorage = getMockedStorage();
    const loadSdk = jest.fn(() => createSdkMock());
    const { initializeClarityWithStoredConsent } = require('@/utils/clarity');

    mockedStorage.getItem.mockResolvedValue('enabled');

    await expect(
      initializeClarityWithStoredConsent({
        loadSdk,
        platform: 'web',
        projectId: 'clarity-project-id',
      }),
    ).resolves.toBe(false);
    expect(loadSdk).not.toHaveBeenCalled();
  });

  it('이미 시작한 Clarity는 저장된 동의를 다시 적용할 때 재개한다', async () => {
    const mockedStorage = getMockedStorage();
    const claritySdk = createSdkMock();
    const options = {
      isDevelopment: false,
      loadSdk: () => claritySdk,
      platform: 'ios',
      projectId: 'clarity-project-id',
    };
    const { initializeClarityWithStoredConsent } = require('@/utils/clarity');

    mockedStorage.getItem.mockResolvedValue('enabled');

    await initializeClarityWithStoredConsent(options);
    await expect(initializeClarityWithStoredConsent(options)).resolves.toBe(
      true,
    );
    expect(claritySdk.resume).toHaveBeenCalledTimes(1);
  });

  it('Clarity가 시작되지 않은 상태에서도 수집 거부 선택을 저장한다', async () => {
    const mockedStorage = getMockedStorage();
    const { setClarityAnalyticsEnabled } = require('@/utils/clarity');

    await expect(setClarityAnalyticsEnabled(false)).resolves.toBeUndefined();
    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      'clarityAnalyticsCollectionPreference:v1',
      'disabled',
    );
  });

  it('현재 세션 중지에 실패하면 호출자에게 오류를 전달한다', async () => {
    const mockedStorage = getMockedStorage();
    const claritySdk = createSdkMock();
    const {
      initializeClarityWithStoredConsent,
      setClarityAnalyticsEnabled,
    } = require('@/utils/clarity');

    mockedStorage.getItem.mockResolvedValue('enabled');
    await initializeClarityWithStoredConsent({
      loadSdk: () => claritySdk,
      platform: 'ios',
      projectId: 'clarity-project-id',
    });
    claritySdk.pause.mockRejectedValueOnce(new Error('pause failed'));

    await expect(setClarityAnalyticsEnabled(false)).rejects.toThrow(
      'pause failed',
    );
  });

  it('활성화 롤백 값을 저장하지 못하면 동의 키를 제거한다', async () => {
    const mockedStorage = getMockedStorage();
    const claritySdk = createSdkMock();
    const { setClarityAnalyticsEnabled } = require('@/utils/clarity');

    mockedStorage.setItem
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('rollback storage failed'));
    claritySdk.consent.mockRejectedValueOnce(new Error('consent failed'));

    await expect(
      setClarityAnalyticsEnabled(true, {
        loadSdk: () => claritySdk,
        platform: 'ios',
        projectId: 'clarity-project-id',
      }),
    ).rejects.toThrow('consent failed');
    expect(mockedStorage.removeItem).toHaveBeenCalledWith(
      'clarityAnalyticsCollectionPreference:v1',
    );
  });
});
