import { Alert, Image, Linking, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useToast } from '@/contexts/ToastContext';
import { useCreateRequestMutation } from '@repo/shared/hooks/useRequest';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { useRoutineStore } from '@/store/routine.store';
import { COLORS } from '@/theme/colors';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';
import { useCreateForm } from '@/hooks/useForm';
import RequetButtonGroup from '../request/RequestButtonGroup';
import { requestFormValidators } from '@repo/shared/service/validatorMessage';

const { Form, FormItem, useForm } = useCreateForm<{ image: string }>();

const RequestModal = () => {
  const routineId = useRoutineStore((state) => state.routineId);
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);
  const { showToast } = useToast();

  const saveRequest = useCreateRequestMutation();

  const router = useRouter();

  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

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
    } catch {
      showToast('인증 요청에 실패했습니다.', 'error');
    }
  };

  const pickImage = async (setValue: (name: 'image', value: string) => void) => {
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

  const takePickture = async (setValue: (name: 'image', value: string) => void) => {
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
      <ThemeView>
        <ThemeText variant="subtitle" style={[styles.info, styles.infoLabel]}>
          루틴 이름
        </ThemeText>
        <ThemeText style={styles.info}>{detail?.routineName}</ThemeText>
      </ThemeView>
      <ThemeView style={styles.line}>
        <ThemeText style={styles.info}>{detail?.routineDetail}</ThemeText>
      </ThemeView>

      <Form form={{ image: '' }} onSubmit={handleSubmit} validators={requestFormValidators}>
        <FormItem
          name="image"
          label="이미지 업로드"
          children={({ form, setValue }) => (
            <>
              <ThemeView style={styles.imageContainer}>
                <Button
                  variant="plain"
                  icon={
                    <Ionicons
                      name="image-outline"
                      size={20}
                      color={COLORS[colorScheme].icon}
                    />
                  }
                  style={styles.phone}
                  onPress={() => pickImage(setValue)}
                />
                <Button
                  icon={
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color={COLORS[colorScheme].icon}
                    />
                  }
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

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 30,
      gap: 20,
      paddingHorizontal: 10,
    },

    line: {
      paddingBottom: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS[colorScheme].grey,
    },

    infoLabel: {
      fontWeight: 'bold',
      marginBottom: 10,
    },

    info: {
      color: COLORS[colorScheme].text,
    },

    imageContainer: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 10,
    },

    phone: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      backgroundColor: COLORS[colorScheme].grey,
      alignItems: 'center',
      justifyContent: 'center',
    },

    preview: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 5,
    },
  });
