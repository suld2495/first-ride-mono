import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../../../../package.json'), 'utf8'),
) as {
  pnpm?: { patchedDependencies?: Record<string, string> };
};
const reactNativePatchPath = resolve(
  __dirname,
  '../../../../patches/react-native@0.81.5.patch',
);

describe('React Native 배포 바이너리', () => {
  it('React Native 코어 패치 없이 Expo 사전 빌드 바이너리를 사용한다', () => {
    expect(packageJson.pnpm?.patchedDependencies).not.toHaveProperty(
      'react-native@0.81.5',
    );
    expect(existsSync(reactNativePatchPath)).toBe(false);
  });
});
