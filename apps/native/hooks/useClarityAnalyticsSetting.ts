import { useCallback, useEffect, useState } from 'react';

import { useToast } from '@/contexts/ToastContext';
import {
  getClarityAnalyticsEnabled,
  setClarityAnalyticsEnabled,
} from '@/utils/clarity';
import {
  getFirebaseAnalyticsEnabled,
  setFirebaseAnalyticsEnabled,
} from '@/utils/firebase-analytics';

interface UseAnalyticsSettingOptions {
  displayName: string;
  getEnabled: () => Promise<boolean>;
  setEnabled: (enabled: boolean) => Promise<void>;
}

const useAnalyticsSetting = ({
  displayName,
  getEnabled,
  setEnabled,
}: UseAnalyticsSettingOptions) => {
  const { showToast } = useToast();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const enabled = await getEnabled();

      if (isMounted) {
        setAnalyticsEnabled(enabled);
        setIsReady(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [getEnabled]);

  const setAnalyticsConsent = useCallback(
    async (enabled: boolean) => {
      setIsSaving(true);

      try {
        await setEnabled(enabled);
        setAnalyticsEnabled(enabled);
        showToast(
          enabled
            ? `${displayName} 분석을 켰습니다.`
            : `${displayName} 분석을 껐습니다.`,
          'success',
        );
      } catch {
        const storedValue = await getEnabled();

        setAnalyticsEnabled(storedValue);
        showToast(`${displayName} 설정을 변경하지 못했습니다.`, 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [displayName, getEnabled, setEnabled, showToast],
  );

  return {
    analyticsEnabled,
    isReady,
    isSaving,
    setAnalyticsConsent,
  };
};

export const useClarityAnalyticsSetting = () =>
  useAnalyticsSetting({
    displayName: 'Microsoft Clarity',
    getEnabled: getClarityAnalyticsEnabled,
    setEnabled: setClarityAnalyticsEnabled,
  });

export const useFirebaseAnalyticsSetting = () =>
  useAnalyticsSetting({
    displayName: 'Firebase Analytics',
    getEnabled: getFirebaseAnalyticsEnabled,
    setEnabled: setFirebaseAnalyticsEnabled,
  });
