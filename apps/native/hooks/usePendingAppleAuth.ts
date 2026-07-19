import { usePendingAppleAuthStore } from '@/store/pending-apple-auth.store';

export function usePendingAppleAuth() {
  const credential = usePendingAppleAuthStore((state) => state.credential);
  const clearCredential = usePendingAppleAuthStore(
    (state) => state.clearCredential,
  );
  const consumeAuthorizationCode = usePendingAppleAuthStore(
    (state) => state.consumeAuthorizationCode,
  );

  return { credential, clearCredential, consumeAuthorizationCode };
}
