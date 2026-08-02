export const CLARITY_ANALYTICS_PREFERENCE_KEY =
  'clarityAnalyticsCollectionPreference:v1';

export const FIREBASE_ANALYTICS_PREFERENCE_KEY =
  'firebaseAnalyticsCollectionPreference:v1';

export const ENABLED_ANALYTICS_PREFERENCE = 'enabled';
export const DISABLED_ANALYTICS_PREFERENCE = 'disabled';

export function resolveAnalyticsPreference(
  storedValue: string | null | undefined,
): boolean | null {
  if (storedValue === ENABLED_ANALYTICS_PREFERENCE) {
    return true;
  }

  if (storedValue === DISABLED_ANALYTICS_PREFERENCE) {
    return false;
  }

  return null;
}
