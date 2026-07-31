import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const getWhatsNewDismissedKey = (buildNumber: number) =>
  `whats-new-dismissed-build:${buildNumber}`;

export const useWhatsNewModal = (buildNumber: number | null) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsVisible(false);

    if (buildNumber === null) {
      return () => {
        isMounted = false;
      };
    }

    const restoreVisibility = async () => {
      try {
        const dismissed = await AsyncStorage.getItem(
          getWhatsNewDismissedKey(buildNumber),
        );

        if (isMounted) {
          setIsVisible(dismissed !== 'true');
        }
      } catch {
        if (isMounted) {
          setIsVisible(false);
        }
      }
    };

    void restoreVisibility();

    return () => {
      isMounted = false;
    };
  }, [buildNumber]);

  const dismiss = useCallback(() => {
    setIsVisible(false);

    if (buildNumber !== null) {
      void AsyncStorage.setItem(
        getWhatsNewDismissedKey(buildNumber),
        'true',
      ).catch(() => undefined);
    }
  }, [buildNumber]);

  return {
    dismiss,
    isVisible,
  };
};
