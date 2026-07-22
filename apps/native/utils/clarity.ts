import AsyncStorage from '@react-native-async-storage/async-storage';
import type * as ClaritySdkModule from '@microsoft/react-native-clarity';
import { Platform } from 'react-native';

import { getClarityProjectId } from '@/utils/env';

type ClaritySdk = typeof ClaritySdkModule;

interface InitializeClarityOptions {
  isDevelopment?: boolean;
  loadSdk?: () => ClaritySdk;
  platform?: string;
  projectId?: string | null;
}

const SUPPORTED_PLATFORMS = new Set(['android', 'ios']);

export const CLARITY_ANALYTICS_PREFERENCE_KEY =
  'clarityAnalyticsCollectionPreference:v1';

const ENABLED_PREFERENCE = 'enabled';
const DISABLED_PREFERENCE = 'disabled';

const loadClaritySdk = (): ClaritySdk =>
  require('@microsoft/react-native-clarity') as ClaritySdk;

let isClarityInitialized = false;
let activeClaritySdk: ClaritySdk | null = null;

export function initializeClarity({
  isDevelopment = process.env.NODE_ENV !== 'production',
  loadSdk = loadClaritySdk,
  platform = Platform.OS,
  projectId = getClarityProjectId(),
}: InitializeClarityOptions = {}): boolean {
  const normalizedProjectId = projectId?.trim();

  if (
    isClarityInitialized ||
    !normalizedProjectId ||
    !SUPPORTED_PLATFORMS.has(platform)
  ) {
    return false;
  }

  const claritySdk = loadSdk();

  claritySdk.initialize(normalizedProjectId, {
    logLevel: isDevelopment
      ? claritySdk.LogLevel.Verbose
      : claritySdk.LogLevel.None,
  });
  isClarityInitialized = true;
  activeClaritySdk = claritySdk;

  return true;
}

export async function getClarityAnalyticsEnabled(): Promise<boolean> {
  try {
    return (
      (await AsyncStorage.getItem(CLARITY_ANALYTICS_PREFERENCE_KEY)) ===
      ENABLED_PREFERENCE
    );
  } catch {
    return false;
  }
}

export async function initializeClarityWithStoredConsent(
  options: InitializeClarityOptions = {},
): Promise<boolean> {
  if (!(await getClarityAnalyticsEnabled())) {
    return false;
  }

  const wasInitialized = isClarityInitialized;
  const initialized = initializeClarity(options);
  const claritySdk = activeClaritySdk;

  if (!claritySdk) {
    return false;
  }

  await claritySdk.consent(false, true);

  if (wasInitialized) {
    await claritySdk.resume();
  }

  return initialized || wasInitialized;
}

export async function setClarityAnalyticsEnabled(
  enabled: boolean,
  options: InitializeClarityOptions = {},
): Promise<void> {
  await AsyncStorage.setItem(
    CLARITY_ANALYTICS_PREFERENCE_KEY,
    enabled ? ENABLED_PREFERENCE : DISABLED_PREFERENCE,
  );

  if (enabled) {
    const wasInitialized = isClarityInitialized;

    initializeClarity(options);

    if (!activeClaritySdk) {
      return;
    }

    await activeClaritySdk.consent(false, true);

    if (wasInitialized) {
      await activeClaritySdk.resume();
    }

    return;
  }

  if (!activeClaritySdk) {
    return;
  }

  const results = await Promise.allSettled([
    activeClaritySdk.consent(false, false),
    activeClaritySdk.pause(),
  ]);
  const failedResult = results.find((result) => result.status === 'rejected');

  if (failedResult?.status === 'rejected') {
    throw failedResult.reason;
  }
}
