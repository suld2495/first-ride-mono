import { useEffect } from 'react';

import { useOnboardingStore } from '@/store/onboarding.store';

interface UseOnboardingReturn {
  isLoading: boolean;
  isCompleted: boolean;
  complete: () => Promise<void>;
}

export const useOnboarding = (): UseOnboardingReturn => {
  const isHydrated = useOnboardingStore((state) => state.isHydrated);
  const isCompleted = useOnboardingStore((state) => state.isCompleted);
  const hydrate = useOnboardingStore((state) => state.hydrate);
  const complete = useOnboardingStore((state) => state.complete);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return { isLoading: !isHydrated, isCompleted, complete };
};
