import { useCallback, useEffect, useState } from 'react';

import { useToast } from '@/contexts/ToastContext';
import {
  getClarityAnalyticsEnabled,
  setClarityAnalyticsEnabled,
} from '@/utils/clarity';

export const useClarityAnalyticsSetting = () => {
  const { showToast } = useToast();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const enabled = await getClarityAnalyticsEnabled();

      if (isMounted) {
        setAnalyticsEnabled(enabled);
        setIsReady(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const setAnalyticsConsent = useCallback(
    async (enabled: boolean) => {
      setIsSaving(true);

      try {
        await setClarityAnalyticsEnabled(enabled);
        setAnalyticsEnabled(enabled);
        showToast(
          enabled
            ? '사용 데이터 분석을 켰습니다.'
            : '사용 데이터 분석을 껐습니다.',
          'success',
        );
      } catch {
        const storedValue = await getClarityAnalyticsEnabled();

        setAnalyticsEnabled(storedValue);
        showToast('분석 수집 설정을 변경하지 못했습니다.', 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [showToast],
  );

  return {
    analyticsEnabled,
    isReady,
    isSaving,
    setAnalyticsConsent,
  };
};
