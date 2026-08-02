import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Analytics } from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

import {
  CLARITY_ANALYTICS_PREFERENCE_KEY,
  DISABLED_ANALYTICS_PREFERENCE,
  ENABLED_ANALYTICS_PREFERENCE,
  FIREBASE_ANALYTICS_PREFERENCE_KEY,
  resolveAnalyticsPreference,
} from '@/utils/analytics-preferences';

interface FirebaseAnalyticsOptions {
  loadAnalytics?: () => Analytics;
  platform?: string;
}

const SUPPORTED_PLATFORMS = new Set(['android', 'ios']);

export { FIREBASE_ANALYTICS_PREFERENCE_KEY };

const loadFirebaseAnalytics = (): Analytics => {
  const { getAnalytics } = require('@react-native-firebase/analytics') as {
    getAnalytics: () => Analytics;
  };

  return getAnalytics();
};

async function applyFirebaseAnalyticsCollection(
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

export async function getFirebaseAnalyticsEnabled(): Promise<boolean> {
  try {
    const firebasePreference = resolveAnalyticsPreference(
      await AsyncStorage.getItem(FIREBASE_ANALYTICS_PREFERENCE_KEY),
    );

    if (firebasePreference !== null) {
      return firebasePreference;
    }

    const previousCombinedPreference = resolveAnalyticsPreference(
      await AsyncStorage.getItem(CLARITY_ANALYTICS_PREFERENCE_KEY),
    );

    return previousCombinedPreference ?? true;
  } catch {
    return false;
  }
}

export async function initializeFirebaseAnalyticsWithStoredPreference(
  options: FirebaseAnalyticsOptions = {},
): Promise<boolean> {
  const enabled = await getFirebaseAnalyticsEnabled();

  await applyFirebaseAnalyticsCollection(enabled, options);
  return enabled;
}

async function restoreFirebasePreference(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(
      FIREBASE_ANALYTICS_PREFERENCE_KEY,
      enabled ? ENABLED_ANALYTICS_PREFERENCE : DISABLED_ANALYTICS_PREFERENCE,
    );
  } catch {
    await AsyncStorage.removeItem(FIREBASE_ANALYTICS_PREFERENCE_KEY);
  }
}

export async function setFirebaseAnalyticsEnabled(
  enabled: boolean,
  options: FirebaseAnalyticsOptions = {},
): Promise<void> {
  const previousPreference = await getFirebaseAnalyticsEnabled();

  await AsyncStorage.setItem(
    FIREBASE_ANALYTICS_PREFERENCE_KEY,
    enabled ? ENABLED_ANALYTICS_PREFERENCE : DISABLED_ANALYTICS_PREFERENCE,
  );

  try {
    await applyFirebaseAnalyticsCollection(enabled, options);
  } catch (error) {
    await restoreFirebasePreference(previousPreference);
    throw error;
  }
}
