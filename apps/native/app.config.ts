import { ConfigContext, ExpoConfig } from 'expo/config';

// EAS CLI가 config를 파싱할 때 환경변수가 없을 수 있으므로 placeholder 사용
// 실제 빌드 시에는 eas.json의 env 또는 EAS Secrets에서 주입됨
const KAKAO_NATIVE_APP_KEY =
  process.env.KAKAO_NATIVE_APP_KEY || 'KAKAO_KEY_PLACEHOLDER';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'first-ride',
  slug: 'first-ride',
  version: '1.0.0',
  scheme: 'first-ride',
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'react-native-edge-to-edge',
    ['expo-dev-launcher', { launchMode: 'most-recent' }],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow $(PRODUCT_NAME) to access your photos',
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
      },
    ],
    ['expo-web-browser', { experimentalLauncherActivity: true }],
    'expo-secure-store',
    [
      'expo-notifications',
      { color: '#7edcd5', defaultChannel: 'routine-channel' },
    ],
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: [
            'https://devrepo.kakao.com/nexus/content/groups/public/',
          ],
        },
      },
    ],
    [
      '@react-native-kakao/core',
      {
        nativeAppKey: KAKAO_NATIVE_APP_KEY,
        ios: {
          handleKakaoOpenUrl: true,
        },
        android: {
          authCodeHandlerActivity: true,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#7edcd5',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mannal.firstride',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSUserNotificationsUsageDescription:
        '알림을 통해 메이트의 루틴 인증 요청을 받을 수 있습니다.',
      CFBundleURLTypes: [
        { CFBundleURLSchemes: [`kakao${KAKAO_NATIVE_APP_KEY}`] },
      ],
      LSApplicationQueriesSchemes: ['kakaokompassauth', 'kakaolink'],
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#76dcd1',
    },
    package: 'com.mannal.firstride',
    jsEngine: 'hermes',
    scheme: ['com.mannal.firstride'],
  },
  extra: {
    router: {},
    eas: {
      projectId: '1d17c608-a305-47a2-9b5c-659fcff4ff7c',
    },
    feedback:
      'https://docs.google.com/forms/d/e/1FAIpQLSe_MCFeYCVJ6xolSkGSENYZ3tI9yz3KO7NTRSMHt6aAMz_4lg/viewform?usp=dialog',
  },
});
