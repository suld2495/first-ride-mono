interface ClaritySdkMock {
  LogLevel: {
    None: 'None';
    Verbose: 'Verbose';
  };
  initialize: jest.Mock;
}

const createSdkMock = (): ClaritySdkMock => ({
  LogLevel: {
    None: 'None',
    Verbose: 'Verbose',
  },
  initialize: jest.fn(),
});

describe('initializeClarity', () => {
  const originalClarityProjectId = process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID;

  beforeEach(() => {
    jest.resetModules();
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
});
