import type { JoinForm } from '@repo/types';

import { usePendingSignUpStore } from '@/store/pending-sign-up.store';

export const usePendingSignUpPayload = () =>
  usePendingSignUpStore((state) => state.payload);

export const useSetPendingSignUpPayload = () =>
  usePendingSignUpStore((state) => state.setPayload);

export const useClearPendingSignUpPayload = () =>
  usePendingSignUpStore((state) => state.clearPayload);

export const setPendingSignUpPayload = (payload: JoinForm) => {
  usePendingSignUpStore.getState().setPayload(payload);
};

export const clearPendingSignUpPayload = () => {
  usePendingSignUpStore.getState().clearPayload();
};
