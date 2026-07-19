import fs from 'node:fs';
import path from 'node:path';

const REPOSITORY_ROOT = path.resolve(__dirname, '../../../..');
const NATIVE_APP_ROOT = path.join(REPOSITORY_ROOT, 'apps/native');

const readAppFile = (relativePath: string): string =>
  fs.readFileSync(path.join(NATIVE_APP_ROOT, relativePath), 'utf8');

describe('web platform boundaries', () => {
  it('웹 어댑터는 Kakao와 Expo 알림 런타임을 import하지 않는다', () => {
    const adapterPaths = [
      'utils/initialize-kakao.web.ts',
      'utils/notifications.web.ts',
      'hooks/useNotifications.web.ts',
    ];
    const missingAdapters = adapterPaths.filter(
      (relativePath) =>
        !fs.existsSync(path.join(NATIVE_APP_ROOT, relativePath)),
    );

    expect(missingAdapters).toEqual([]);

    const kakaoWebAdapter = readAppFile('utils/initialize-kakao.web.ts');
    const notificationWebAdapter = readAppFile('utils/notifications.web.ts');
    const notificationHookWebAdapter = readAppFile(
      'hooks/useNotifications.web.ts',
    );

    expect(kakaoWebAdapter).not.toContain('@react-native-kakao');
    expect(notificationWebAdapter).not.toContain('expo-notifications');
    expect(notificationHookWebAdapter).not.toContain('expo-notifications');
  });

  it('개발 런타임은 Node.js 22로 고정한다', () => {
    const nvmVersionPath = path.join(REPOSITORY_ROOT, '.nvmrc');

    expect(fs.existsSync(nvmVersionPath)).toBe(true);

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(REPOSITORY_ROOT, 'package.json'), 'utf8'),
    ) as { engines?: { node?: string } };
    const nvmVersion = fs.readFileSync(nvmVersionPath, 'utf8').trim();

    expect(packageJson.engines?.node).toBe('22.x');
    expect(nvmVersion).toBe('22');
  });
});
