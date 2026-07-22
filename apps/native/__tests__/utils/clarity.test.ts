import AsyncStorage from '@react-native-async-storage/async-storage';

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
  setItem: jest.fn(),
}));

const mockedStorage = jest.mocked(AsyncStorage);

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
});
