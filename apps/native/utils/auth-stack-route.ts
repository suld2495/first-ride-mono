export const getAuthStackInitialRouteName = (isSignedIn: boolean) =>
  isSignedIn ? '(tabs)' : 'sign-in';

export const getAuthStackKey = (isSignedIn: boolean) =>
  isSignedIn ? 'auth-stack-signed-in' : 'auth-stack-signed-out';
