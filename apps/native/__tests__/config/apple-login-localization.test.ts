import appConfig from '../../app.config';

describe('Apple 로그인 버튼 로컬라이제이션', () => {
  it('iOS 앱의 기본 언어와 지원 언어를 한국어로 선언한다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);

    expect(config.locales).toEqual({
      ko: './locales/ko.json',
    });
    expect(config.ios?.infoPlist).toEqual(
      expect.objectContaining({
        CFBundleAllowMixedLocalizations: true,
        CFBundleDevelopmentRegion: 'ko',
      }),
    );
  });
});
