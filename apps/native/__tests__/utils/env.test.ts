describe('getKakaoNativeAppKey', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
    delete process.env.KAKAO_NATIVE_APP_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('public 환경변수가 있으면 그 값을 사용한다', () => {
    process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY = 'public-key';

    const { getKakaoNativeAppKey } = require('@/utils/env');

    expect(getKakaoNativeAppKey()).toBe('public-key');
  });

  it('public 환경변수가 없으면 native 환경변수 값을 사용한다', () => {
    process.env.KAKAO_NATIVE_APP_KEY = 'native-key';

    const { getKakaoNativeAppKey } = require('@/utils/env');

    expect(getKakaoNativeAppKey()).toBe('native-key');
  });

  it('설정된 키가 없으면 null을 반환한다', () => {
    const { getKakaoNativeAppKey } = require('@/utils/env');

    expect(getKakaoNativeAppKey()).toBeNull();
  });
});
