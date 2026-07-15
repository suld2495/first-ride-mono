import { ApiError } from '@repo/shared/api/AppError';
import { useCreateRequestMutation } from '@repo/shared/hooks/useRequest';
import { routineKeys } from '@repo/shared/types/query-keys/routine';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';
import {
  normalizeRequestImages,
  type RequestImage,
  type RequestImageSource,
} from '@/utils/request-image';

interface RoutineDetailInfo {
  nickname: string;
  isMe: boolean;
  paused: boolean;
}

export const MAX_REQUEST_IMAGE_COUNT = 3;

export type { RequestImage } from '@/utils/request-image';

type RequestImageForm = {
  images: RequestImage[];
};

type SetImageValue = (name: 'images', value: RequestImage[]) => void;

const showPermissionAlert = (title: string, message: string) => {
  Alert.alert(title, message, [
    { text: 'Open settings', onPress: () => Linking.openSettings() },
    { text: 'Cancel' },
  ]);
};

export const useRequestSubmission = (
  routineId: number,
  detail?: RoutineDetailInfo,
) => {
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const saveRequest = useCreateRequestMutation();

  const handleSubmit = useCallback(
    (submittedForm: RequestImageForm) => {
      if (!submittedForm.images.length || !detail) {
        return;
      }

      if (detail.paused) {
        showToast('일시정지된 루틴은 인증 요청을 보낼 수 없습니다.', 'error');
        return;
      }

      const formData = new FormData();

      for (const image of submittedForm.images) {
        const file = {
          uri: image.uri,
          name: image.name,
          type: image.type,
        };

        formData.append('images', file as unknown as Blob);
      }
      formData.append('routineId', routineId.toString());

      saveRequest.mutate(formData, {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: routineKeys.list(detail.nickname),
          });
          showToast(
            detail.isMe
              ? '인증이 완료되었습니다.'
              : '인증 요청이 완료되었습니다.',
            'success',
          );
          router.dismissTo('/(tabs)/(afterLogin)/(routine)');
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 413) {
            showToast(
              '이미지는 1장당 10MB 이하로 업로드할 수 있습니다.',
              'error',
            );
            return;
          }

          const errorMessage = getApiErrorMessage(
            error,
            '인증 요청에 실패했습니다. 다시 시도해주세요.',
          );

          showToast(errorMessage, 'error');
        },
      });
    },
    [detail, queryClient, routineId, router, saveRequest, showToast],
  );

  const addNormalizedImages = useCallback(
    async (
      sources: RequestImageSource[],
      setValue: SetImageValue,
      currentImages: RequestImage[],
    ) => {
      const { images, rejectedCount } = await normalizeRequestImages(sources);

      if (rejectedCount > 0) {
        showToast('업로드할 수 없는 이미지는 제외했습니다.', 'error');
      }

      if (!images.length) {
        return;
      }

      const sourceUris = new Set<string>();
      const nextImages = [...currentImages, ...images].filter((image) => {
        if (sourceUris.has(image.sourceUri)) {
          return false;
        }

        sourceUris.add(image.sourceUri);
        return true;
      });

      setValue('images', nextImages.slice(0, MAX_REQUEST_IMAGE_COUNT));
    },
    [showToast],
  );

  const pickImage = useCallback(
    async (setValue: SetImageValue, currentImages: RequestImage[]) => {
      try {
        const remainingImageCount =
          MAX_REQUEST_IMAGE_COUNT - currentImages.length;

        if (remainingImageCount <= 0) {
          return;
        }

        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          showPermissionAlert(
            'Photos permission not granted',
            'Please grant Photos permission to use this feature',
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: remainingImageCount,
          orderedSelection: true,
        });

        if (!result.canceled) {
          await addNormalizedImages(
            result.assets.map(({ uri, width, height }) => ({
              uri,
              width,
              height,
            })),
            setValue,
            currentImages,
          );
        }
      } catch {
        showToast('이미지를 불러오지 못했습니다.', 'error');
      }
    },
    [addNormalizedImages, showToast],
  );

  const takePicture = useCallback(
    async (setValue: SetImageValue, currentImages: RequestImage[]) => {
      try {
        if (currentImages.length >= MAX_REQUEST_IMAGE_COUNT) {
          return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
          showPermissionAlert(
            'Camera permission not granted',
            'Please grant Camera permission to use this feature',
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: false,
        });

        if (!result.canceled) {
          const asset = result.assets[0];

          if (asset) {
            await addNormalizedImages(
              [
                {
                  uri: asset.uri,
                  width: asset.width,
                  height: asset.height,
                },
              ],
              setValue,
              currentImages,
            );
          }
        }
      } catch {
        showToast('카메라를 실행하지 못했습니다.', 'error');
      }
    },
    [addNormalizedImages, showToast],
  );

  return {
    handleSubmit,
    pickImage,
    takePicture,
    isPending: saveRequest.isPending,
  };
};
