import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import OnboardingScreen from '@/components/onboarding/onboarding-screen';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Onboarding() {
  const router = useRouter();
  const user = useAuthUser();
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const { complete } = useOnboarding();
  const isReplay = replay === 'true';
  const submitting = useRef(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setIsCompleting(true);
    setError(null);

    try {
      if (!isReplay) await complete();

      if (isReplay && router.canGoBack()) {
        router.back();
      } else {
        router.replace(user ? '/(tabs)/(afterLogin)/(routine)' : '/sign-in');
      }
    } catch {
      setError('안내 완료 상태를 저장하지 못했어요. 다시 시도해주세요.');
    } finally {
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
        isCompleting={isCompleting}
        isReplay={isReplay}
        error={error}
      />
    </>
  );
}
