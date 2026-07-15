import { useEffect, useState } from 'react';

import { useToast } from '@/contexts/ToastContext';
import type { RequestImage } from '@/hooks/useRequestSubmission';
import {
  clearPendingRoutineShare,
  getPendingRoutineShare,
} from '@/share/routine-share';
import { normalizeRequestImages } from '@/utils/request-image';

export const usePendingRoutineShareImages = (
  routineId: number,
  shareSessionId?: string,
): RequestImage[] => {
  const [sharedImages, setSharedImages] = useState<RequestImage[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (!shareSessionId || !routineId) {
      return;
    }

    let isMounted = true;

    const loadPendingShare = async (): Promise<void> => {
      try {
        const payload = await getPendingRoutineShare(shareSessionId);

        if (!payload || payload.routineId !== routineId) {
          return;
        }

        const { images, rejectedCount } = await normalizeRequestImages(
          payload.images,
        );

        if (!isMounted) {
          return;
        }

        setSharedImages(images);

        if (rejectedCount > 0) {
          showToast('업로드할 수 없는 이미지는 제외했습니다.', 'error');
        }

        await clearPendingRoutineShare(shareSessionId);
      } catch {
        if (isMounted) {
          showToast('공유 이미지를 불러오지 못했습니다.', 'error');
        }
      }
    };

    void loadPendingShare();

    return () => {
      isMounted = false;
    };
  }, [routineId, shareSessionId, showToast]);

  return sharedImages;
};
