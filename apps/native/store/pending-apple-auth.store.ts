import { create } from 'zustand';

import type {
  ApplePayload,
  SocialPayload,
  SocialProviderType,
} from '@/providers/auth/types';

const PENDING_AUTH_TTL_MS = 5 * 60 * 1000;

type PendingSocialCredential = ApplePayload | SocialPayload;

export interface PendingSocialAuthAttempt {
  id: string;
  provider: SocialProviderType;
  credential: PendingSocialCredential;
  expiresAt: number;
}

interface PendingSocialAuthState {
  attempt: PendingSocialAuthAttempt | null;
  beginAttempt: (credential: PendingSocialCredential) => string;
  getValidAttempt: (now?: number) => PendingSocialAuthAttempt | null;
  consumeAuthorizationCode: (attemptId: string) => string | undefined;
  clearAttempt: (attemptId?: string) => void;
}

let attemptSequence = 0;
let expirationTimer: ReturnType<typeof setTimeout> | null = null;

const cancelExpirationTimer = () => {
  if (expirationTimer !== null) {
    clearTimeout(expirationTimer);
    expirationTimer = null;
  }
};

export const usePendingSocialAuthStore = create<PendingSocialAuthState>()(
  (set, get) => ({
    attempt: null,
    beginAttempt: (credential) => {
      cancelExpirationTimer();

      const id = `social-auth-${++attemptSequence}`;
      const expiresAt = Math.min(
        credential.expiresAt,
        Date.now() + PENDING_AUTH_TTL_MS,
      );
      const attempt = {
        id,
        provider: credential.provider,
        credential,
        expiresAt,
      };

      set({ attempt });
      expirationTimer = setTimeout(
        () => {
          if (get().attempt?.id === id) {
            set({ attempt: null });
          }
          expirationTimer = null;
        },
        Math.max(0, expiresAt - Date.now()),
      );

      return id;
    },
    getValidAttempt: (now = Date.now()) => {
      const { attempt } = get();

      if (!attempt || attempt.expiresAt <= now) {
        if (attempt) {
          cancelExpirationTimer();
          set({ attempt: null });
        }

        return null;
      }

      return attempt;
    },
    consumeAuthorizationCode: (attemptId) => {
      const attempt = get().getValidAttempt();

      if (
        !attempt ||
        attempt.id !== attemptId ||
        attempt.credential.provider !== 'apple'
      ) {
        return undefined;
      }

      const { authorizationCode } = attempt.credential;

      if (authorizationCode) {
        set({
          attempt: {
            ...attempt,
            credential: {
              ...attempt.credential,
              authorizationCode: undefined,
            },
          },
        });
      }

      return authorizationCode;
    },
    clearAttempt: (attemptId) => {
      const { attempt } = get();

      if (attemptId && attempt?.id !== attemptId) {
        return;
      }

      cancelExpirationTimer();
      set({ attempt: null });
    },
  }),
);

export const usePendingAppleAuthStore = usePendingSocialAuthStore;
