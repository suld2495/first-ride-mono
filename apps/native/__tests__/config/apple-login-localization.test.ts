import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

  it('앱 이름 로컬라이제이션 키를 플랫폼별 네이티브 키로 구분한다', () => {
    const koreanLocale = JSON.parse(
      readFileSync(resolve(__dirname, '../../locales/ko.json'), 'utf8'),
    );

    expect(koreanLocale).toEqual({
      ios: { CFBundleDisplayName: '이루라' },
      android: { app_name: '이루라' },
    });
  });
});
