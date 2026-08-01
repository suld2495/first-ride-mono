import type { NotificationResponseHandlingMode } from '@/types/notification-types';

export const getAuthStackInitialRouteName = (isSignedIn: boolean) =>
  isSignedIn ? '(tabs)' : 'sign-in';

export const getAuthStackKey = (isSignedIn: boolean) =>
  isSignedIn ? 'auth-stack-signed-in' : 'auth-stack-signed-out';

export const getNotificationResponseHandlingMode = (
  isAuthLoading: boolean,
  isSignedIn: boolean,
): NotificationResponseHandlingMode => {
  if (isAuthLoading) {
    return 'defer';
  }

  return isSignedIn ? 'handle' : 'discard';
};
