import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = resolve(__dirname, '../../../..');
const nativeRoot = resolve(__dirname, '../..');
const rootPackage = JSON.parse(
  readFileSync(resolve(workspaceRoot, 'package.json'), 'utf8'),
) as {
  pnpm?: {
    overrides?: Record<string, string>;
    patchedDependencies?: Record<string, string>;
  };
};
const nativePackage = JSON.parse(
  readFileSync(resolve(nativeRoot, 'package.json'), 'utf8'),
) as {
  dependencies: Record<string, string>;
};

describe('Expo SDK 54 migration', () => {
  it('SDK 54가 요구하는 React Native 런타임을 사용한다', () => {
    expect(nativePackage.dependencies.expo).toMatch(/^~54\./);
    expect(nativePackage.dependencies.react).toBe('19.1.0');
    expect(nativePackage.dependencies['react-dom']).toBe('19.1.0');
    expect(nativePackage.dependencies['react-native']).toMatch(/^0\.81\./);
    expect(nativePackage.dependencies['react-native-worklets']).toBeDefined();
  });

  it('루트 override가 Expo SDK 의존성 정렬을 가로막지 않는다', () => {
    const overrides = rootPackage.pnpm?.overrides ?? {};
    const sdkOwnedOverrides = [
      'expo',
      'react',
      'react-dom',
      'react-native',
      'metro',
      'metro-config',
      'metro-runtime',
      'metro-resolver',
      'metro-source-map',
      'expo-secure-store',
    ].filter((dependency) => dependency in overrides);

    expect(sdkOwnedOverrides).toEqual([]);
  });

  it('React Native는 Expo 사전 빌드 바이너리를 사용할 수 있는 상태다', () => {
    const reactNativeVersion = nativePackage.dependencies['react-native'];
    const patchKey = `react-native@${reactNativeVersion}`;

    expect(rootPackage.pnpm?.patchedDependencies).not.toHaveProperty(patchKey);
  });

  it('SDK 54에서도 기존 파일 정보 API를 legacy 진입점으로 사용한다', () => {
    const fileSystemConsumers = [
      resolve(nativeRoot, 'utils/beta-feedback-image.ts'),
      resolve(nativeRoot, 'utils/request-image.ts'),
    ];

    for (const consumer of fileSystemConsumers) {
      expect(readFileSync(consumer, 'utf8')).toContain(
        "from 'expo-file-system/legacy'",
      );
    }
  });
});
