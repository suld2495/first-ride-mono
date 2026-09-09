import { useNavigationState } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import OnboardingScreen from '@/components/onboarding/onboarding-screen';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Onboarding() {
  const router = useRouter();
  const canNavigateToRoutines = useNavigationState((state) =>
    state.routeNames.includes('(tabs)'),
  );
  const user = useAuthUser();
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const { complete, isRequired } = useOnboarding();
  const isReplay = replay === 'true' && !isRequired;
  const submitting = useRef(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasCompleted || isRequired || !canNavigateToRoutines) return;

    if (isReplay && router.canGoBack()) {
      router.back();
    } else {
      router.replace(user ? '/(tabs)/(afterLogin)/(routine)' : '/sign-in');
    }
  }, [hasCompleted, isRequired, isReplay, canNavigateToRoutines, router, user]);

  const handleComplete = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setIsCompleting(true);
    setError(null);

    try {
      await complete();
      setHasCompleted(true);
    } catch {
      setError('안내 완료 상태를 저장하지 못했어요. 다시 시도해주세요.');
      submitting.current = false;
      setIsCompleting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: isReplay && !isCompleting,
        }}
      />
      <OnboardingScreen
        onComplete={() => void handleComplete()}
        onClose={() => {
          if (isCompleting) return;
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/(afterLogin)/(routine)');
        }}
        isCompleting={isCompleting}
        isReplay={isReplay}
        error={error}
      />
    </>
  );
}
