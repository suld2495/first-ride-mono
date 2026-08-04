import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import appConfig from '../../app.config';

describe('iOS CocoaPods linkage configuration', () => {
  it('Android 소스 빌드는 Play Store용 ARM ABI만 생성한다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);
    const buildPropertiesPlugin = config.plugins?.find(
      (plugin) =>
        Array.isArray(plugin) && plugin[0] === 'expo-build-properties',
    );

    expect(buildPropertiesPlugin).toEqual([
      'expo-build-properties',
      expect.objectContaining({
        android: expect.objectContaining({
          buildArchs: ['armeabi-v7a', 'arm64-v8a'],
          buildReactNativeFromSource: true,
        }),
      }),
    ]);
  });

  it('Expo 설정과 네이티브 Podfile 속성에서 static framework를 동일하게 사용한다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);
    const buildPropertiesPlugin = config.plugins?.find(
      (plugin) =>
        Array.isArray(plugin) && plugin[0] === 'expo-build-properties',
    );
    const podfilePropertiesPath = join(
      __dirname,
      '../../ios/Podfile.properties.json',
    );

    expect(buildPropertiesPlugin).toEqual([
      'expo-build-properties',
      expect.objectContaining({
        android: expect.objectContaining({
          buildReactNativeFromSource: true,
        }),
        ios: expect.objectContaining({
          buildReactNativeFromSource: true,
          useFrameworks: 'static',
        }),
      }),
    ]);
    if (existsSync(podfilePropertiesPath)) {
      const podfileProperties = JSON.parse(
        readFileSync(podfilePropertiesPath, 'utf8'),
      ) as Record<string, unknown>;

      expect(podfileProperties['ios.useFrameworks']).toBe('static');
      expect(podfileProperties['ios.buildReactNativeFromSource']).toBe('true');
    }
  });
});
