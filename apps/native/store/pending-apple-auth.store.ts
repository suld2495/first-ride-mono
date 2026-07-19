import { create } from 'zustand';

import type { ApplePayload } from '@/providers/auth/types';

interface PendingAppleAuthState {
  credential: ApplePayload | null;
  setCredential: (credential: ApplePayload) => void;
  clearCredential: () => void;
}

export const usePendingAppleAuthStore = create<PendingAppleAuthState>()(
  (set) => ({
    credential: null,
    setCredential: (credential) => set({ credential }),
    clearCredential: () => set({ credential: null }),
  }),
);
