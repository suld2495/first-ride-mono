import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { palette } from '@/theme/tokens';

import appConfig from '../../app.config';

describe('스플래시 테마 설정', () => {
  it('blue 999 토큰을 네이티브 스플래시 배경으로 사용한다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);

    expect(config.splash?.backgroundColor).toBe(palette.theme.blue[999]);
  });

  it('커밋된 iOS와 Android 스플래시 리소스에도 blue 999를 적용한다', () => {
    const androidColors = readFileSync(
      resolve(__dirname, '../../android/app/src/main/res/values/colors.xml'),
      'utf8',
    );
    const iosStoryboard = readFileSync(
      resolve(__dirname, '../../ios/app/SplashScreen.storyboard'),
      'utf8',
    );

    expect(androidColors).toContain(
      '<color name="splashscreen_background">#6E9FF3</color>',
    );
    expect(iosStoryboard).toContain(
      'blue="0.952941176470588" green="0.623529411764706" red="0.431372549019608"',
    );
  });
});
