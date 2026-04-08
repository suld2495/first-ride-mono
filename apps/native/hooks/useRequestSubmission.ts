import { ApiError } from '@repo/shared/api/AppError';
import { useCreateRequestMutation } from '@repo/shared/hooks/useRequest';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

interface RoutineDetailInfo {
  nickname: string;
  isMe: boolean;
}

type SetImageValue = (name: 'image', value: string) => void;

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
  const saveRequest = useCreateRequestMutation();

  const handleSubmit = useCallback(
    (submittedForm: { image: string }) => {
      if (!submittedForm.image || !detail) {
        return;
      }

      const formData = new FormData();

      formData.append('base64image', submittedForm.image);
      formData.append('routineId', routineId.toString());
      formData.append('nickname', detail.nickname);

      saveRequest.mutate(formData, {
        onSuccess: () => {
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
    [detail, routineId, router, saveRequest, showToast],
  );

  const pickImage = useCallback(
    async (setValue: SetImageValue) => {
      try {
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
          allowsMultipleSelection: false,
          base64: true,
        });

        if (!result.canceled) {
          setValue('image', result.assets[0]?.base64 ?? '');
        }
      } catch {
        showToast('이미지를 불러오지 못했습니다.', 'error');
      }
    },
    [showToast],
  );

  const takePicture = useCallback(
    async (setValue: SetImageValue) => {
      try {
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
          setValue('image', result.assets[0]?.base64 ?? '');
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
