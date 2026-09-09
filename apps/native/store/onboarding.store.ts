import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_COMPLETED_KEY = 'onboarding-completed';

interface OnboardingState {
  isCompleted: boolean;
  isHydrated: boolean;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  complete: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isCompleted: false,
  isHydrated: false,
  isHydrating: false,
  hydrate: async () => {
    if (get().isHydrated || get().isHydrating) {
      return;
    }

    set({ isHydrating: true });

    try {
      const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);

      set((state) => ({
        isCompleted: state.isCompleted || storedValue === 'true',
      }));
    } catch (error) {
      console.error('[Onboarding] Failed to restore completion', error);
    } finally {
      set({ isHydrated: true, isHydrating: false });
    }
  },
  complete: async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    set({ isCompleted: true, isHydrated: true });
  },
}));
