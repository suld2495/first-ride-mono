import appConfig from '../../app.config';

describe('스플래시 테마 설정', () => {
  it('스플래시 이미지와 동일한 파란색을 네이티브 배경으로 사용한다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);

    expect(config.splash?.backgroundColor).toBe('#59ADF7');
  });

  it('푸시 알림 아이콘은 스플래시 이미지를 사용한다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);

    const notificationsPlugin = config.plugins?.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-notifications',
    );

    expect(notificationsPlugin).toEqual([
      'expo-notifications',
      expect.objectContaining({
        icon: './assets/splash.png',
      }),
    ]);
  });
});
