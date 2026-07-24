import { palette } from '@/theme/tokens';

import appConfig from '../../app.config';

describe('스플래시 테마 설정', () => {
  it('blue 999 토큰을 네이티브 스플래시 배경으로 사용한다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);

    expect(config.splash?.backgroundColor).toBe(palette.theme.blue[999]);
  });
});
