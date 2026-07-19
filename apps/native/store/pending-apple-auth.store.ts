import { create } from 'zustand';

import type { ApplePayload } from '@/providers/auth/types';

interface PendingAppleAuthState {
  credential: ApplePayload | null;
  setCredential: (credential: ApplePayload) => void;
  consumeAuthorizationCode: () => string | undefined;
  clearCredential: () => void;
}

export const usePendingAppleAuthStore = create<PendingAppleAuthState>()(
  (set, get) => ({
    credential: null,
    setCredential: (credential) => set({ credential }),
    consumeAuthorizationCode: () => {
      const credential = get().credential;
      const authorizationCode = credential?.authorizationCode;

      if (credential && authorizationCode) {
        set({
          credential: {
            ...credential,
            authorizationCode: undefined,
          },
        });
      }

      return authorizationCode;
    },
    clearCredential: () => set({ credential: null }),
  }),
);
