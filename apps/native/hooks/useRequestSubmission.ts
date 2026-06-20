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

interface RoutineDetailInfo {
  nickname: string;
  isMe: boolean;
  paused: boolean;
}

const MAX_REQUEST_IMAGE_COUNT = 3;

export type RequestImage = {
  base64: string;
  previewUri: string;
};

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
        formData.append('base64images', image.base64);
      }
      formData.append('routineId', routineId.toString());
      formData.append('nickname', detail.nickname);

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
          router.push('/(tabs)/(afterLogin)/(routine)');
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 413) {
            showToast('용량은 1MB 이하만 업로드 가능합니다.', 'error');
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
          mediaTypes: ['images', 'livePhotos'],
          allowsMultipleSelection: true,
          selectionLimit: remainingImageCount,
          orderedSelection: true,
          base64: true,
        });

        if (!result.canceled) {
          const selectedImages = result.assets
            .map((asset) =>
              asset.base64
                ? {
                    base64: asset.base64,
                    previewUri: asset.uri,
                  }
                : null,
            )
            .filter((image): image is RequestImage => !!image);
          const previewUris = new Set<string>();
          const nextImages = [...currentImages, ...selectedImages].filter(
            (image) => {
              if (previewUris.has(image.previewUri)) {
                return false;
              }

              previewUris.add(image.previewUri);
              return true;
            },
          );

          setValue('images', nextImages.slice(0, MAX_REQUEST_IMAGE_COUNT));
        }
      } catch {
        showToast('이미지를 불러오지 못했습니다.', 'error');
      }
    },
    [showToast],
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
          mediaTypes: ['images', 'livePhotos'],
          allowsMultipleSelection: false,
          base64: true,
        });

        if (!result.canceled) {
          const nextImage = result.assets[0]?.base64;
          const nextPreviewUri = result.assets[0]?.uri;

          if (nextImage && nextPreviewUri) {
            setValue(
              'images',
              [
                ...currentImages,
                {
                  base64: nextImage,
                  previewUri: nextPreviewUri,
                },
              ].slice(0, MAX_REQUEST_IMAGE_COUNT),
            );
          }
        }
      } catch {
        showToast('카메라를 실행하지 못했습니다.', 'error');
      }
    },
    [showToast],
  );

  return {
    handleSubmit,
    pickImage,
    takePicture,
    isPending: saveRequest.isPending,
  };
};
