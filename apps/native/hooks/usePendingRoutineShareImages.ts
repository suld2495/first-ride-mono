import { useEffect, useState } from 'react';

import type { RequestImage } from '@/hooks/useRequestSubmission';
import {
  clearPendingRoutineShare,
  getPendingRoutineShare,
} from '@/share/routine-share';

export const usePendingRoutineShareImages = (
  routineId: number,
  shareSessionId?: string,
): RequestImage[] => {
  const [sharedImages, setSharedImages] = useState<RequestImage[]>([]);

  useEffect(() => {
    if (!shareSessionId || !routineId) {
      return;
    }

    let isMounted = true;

    const loadPendingShare = async () => {
      const payload = await getPendingRoutineShare(shareSessionId);

      if (!isMounted || !payload || payload.routineId !== routineId) {
        return;
      }

      setSharedImages(payload.images);
      await clearPendingRoutineShare(shareSessionId);
    };

    void loadPendingShare();

    return () => {
      isMounted = false;
    };
  }, [routineId, shareSessionId]);

  return sharedImages;
};
