import type { Analytics } from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

interface FirebaseAnalyticsOptions {
  loadAnalytics?: () => Analytics;
  platform?: string;
}

const SUPPORTED_PLATFORMS = new Set(['android', 'ios']);

const loadFirebaseAnalytics = (): Analytics => {
  const { getAnalytics } = require('@react-native-firebase/analytics') as {
    getAnalytics: () => Analytics;
  };

  return getAnalytics();
};

export async function setFirebaseAnalyticsEnabled(
  enabled: boolean,
  {
    loadAnalytics = loadFirebaseAnalytics,
    platform = Platform.OS,
  }: FirebaseAnalyticsOptions = {},
): Promise<void> {
  if (!SUPPORTED_PLATFORMS.has(platform)) {
    return;
  }

  const analytics = loadAnalytics();
  await analytics.setAnalyticsCollectionEnabled(enabled);
}
