import { usePendingSocialAuthStore } from '@/store/pending-apple-auth.store';

export function usePendingSocialAuth() {
  const attempt = usePendingSocialAuthStore((state) => state.attempt);
  const getValidAttempt = usePendingSocialAuthStore(
    (state) => state.getValidAttempt,
  );
  const clearAttempt = usePendingSocialAuthStore((state) => state.clearAttempt);
  const consumeAuthorizationCode = usePendingSocialAuthStore(
    (state) => state.consumeAuthorizationCode,
  );

  return {
    attempt,
    getValidAttempt,
    clearAttempt,
    consumeAuthorizationCode,
  };
}
