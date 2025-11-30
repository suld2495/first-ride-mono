import { Alert, Image, Linking, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ApiError } from '@repo/shared/api/AppError';
import { useCreateRequestMutation } from '@repo/shared/hooks/useRequest';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { requestFormValidators } from '@repo/shared/service/validatorMessage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { useToast } from '@/contexts/ToastContext';
import { useCreateForm } from '@/hooks/useForm';
import { useRoutineStore } from '@/store/routine.store';
import { getApiErrorMessage } from '@/utils/error-utils';

import { Button } from '../common/Button';
import { Divider } from '../common/Divider';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';
import RequetButtonGroup from '../request/RequestButtonGroup';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<{ image: string }>();

const RequestModal = () => {
  const routineId = useRoutineStore((state) => state.routineId);
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);
  const { showToast } = useToast();

  const saveRequest = useCreateRequestMutation();

  const router = useRouter();

  const handleSubmit = async (submitedForm: { image: string }) => {
    if (!submitedForm.image || !detail) return;

    const formData = new FormData();

    formData.append('base64image', submitedForm.image);
    formData.append('routineId', routineId.toString());
    formData.append('nickname', detail.nickname);

    try {
      await saveRequest.mutateAsync(formData);

      if (detail.isMe) {
        showToast('인증이 완료되었습니다.', 'success');
      } else {
        showToast('인증 요청이 완료되었습니다.', 'success');
      }
      router.push('/(tabs)/(afterLogin)/(routine)');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 413) {
          showToast('용량은 1MB 이하만 업로드 가능합니다.', 'error');
          return;
        }
      }

      const errorMessage = getApiErrorMessage(
        err,
        '인증 요청에 실패했습니다. 다시 시도해주세요.',
      );

      showToast(errorMessage, 'error');
    }
  };

  const pickImage = async (
    setValue: (name: 'image', value: string) => void,
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Phones permission not granted',
        'Please grant Phones permission to use this feature',
        [
          { text: 'Open settings', onPress: () => Linking.openSettings() },
          {
            text: 'Cancel',
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'livePhotos'],
      allowsMultipleSelection: false,
      base64: true,
    });

    if (!result.canceled) {
      setValue('image', result.assets[0].base64 || '');
    }
  };

  const takePickture = async (
    setValue: (name: 'image', value: string) => void,
  ) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Camera permission not granted',
        'Please grant Camera permission to use this feature',
        [
          { text: 'Open settings', onPress: () => Linking.openSettings() },
          {
            text: 'Cancel',
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'livePhotos'],
      allowsMultipleSelection: false,
      base64: true,
    });

    if (!result.canceled) {
      setValue('image', result.assets[0].base64 || '');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeView style={styles.container}>
      <ThemeView transparent>
        <Typography variant="subtitle" style={styles.infoLabel}>
          루틴 이름
        </Typography>
        <Typography>{detail?.routineName}</Typography>
      </ThemeView>
      <ThemeView transparent>
        <Typography>{detail?.routineDetail}</Typography>
      </ThemeView>
      <ThemeView transparent>
        <Typography variant="subtitle" style={styles.infoLabel}>
          인증 대상
        </Typography>
        <Typography>{detail?.isMe ? '나' : detail?.mateNickname}</Typography>
        <Divider spacing={20} />
      </ThemeView>

      <Form
        form={{ image: '' }}
        onSubmit={handleSubmit}
        validators={requestFormValidators}
      >
        <FormItem
          name="image"
          label="이미지 업로드"
          item={({ form, setValue }) => (
            <>
              <ThemeView style={styles.imageContainer} transparent>
                <Button
                  testID="gallery-button"
                  variant="secondary"
                  leftIcon={({ color }) => (
                    <Ionicons name="image-outline" size={20} color={color} />
                  )}
                  style={styles.phone}
                  onPress={() => pickImage(setValue)}
                />
                <Button
                  testID="camera-button"
                  variant="secondary"
                  leftIcon={({ color }) => (
                    <Ionicons name="camera-outline" size={20} color={color} />
                  )}
                  style={styles.phone}
                  onPress={() => takePickture(setValue)}
                />
              </ThemeView>
              {form.image && (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${form.image}` }}
                  style={styles.preview}
                />
              )}
            </>
          )}
        />

        <RequetButtonGroup useForm={useForm} />
      </Form>
    </ThemeView>
  );
};

export default RequestModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    gap: 20,
    paddingHorizontal: 10,
  },

  infoLabel: {
    fontWeight: 'bold',
    marginBottom: 10,
  },

  imageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },

  phone: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 5,
  },
});
