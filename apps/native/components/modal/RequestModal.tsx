import { Alert, Image, Linking, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useForm } from '@/hooks/useForm';
import { useCreateRequestMutation } from '@/hooks/useRequest';
import { useRoutineDetailQuery } from '@/hooks/useRoutine';
import { useRoutineStore } from '@/store/routine.store';
import { useUserStore } from '@/store/user.store';
import { COLORS } from '@/theme/colors';

import { Button } from '../common/Button';
import FormItem from '../common/form/FormItem';
import Link from '../common/Link';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

const RequestModal = () => {
  const { form, errors, handleChange, validate } = useForm<{ image: string }>({
    initialState: {
      image: '',
    },
    validator: {
      image: { required: true },
    },
  });

  const routineId = useRoutineStore((state) => state.routineId);
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);

  const saveRequest = useCreateRequestMutation();

  const router = useRouter();

  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const isValid = validate(form);

  const handleSubmit = async (submitedForm: { image: string }) => {
    if (!submitedForm.image || !detail) return;

    const formData = new FormData();

    formData.append('base64image', submitedForm.image);
    formData.append('routineId', routineId.toString());
    formData.append('nickname', detail.nickname);

    try {
      await saveRequest.mutateAsync(formData);
      alert('인증 요청이 완료되었습니다.');
      router.push('/(tabs)/(afterLogin)/(routine)');
    } catch {
      alert('인증 요청에 실패했습니다.');
    }
  };

  const pickImage = async () => {
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
      handleChange('image', result.assets[0].base64);
    }
  };

  const takePickture = async () => {
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
      handleChange('image', result.assets[0].base64);
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
      <FormItem
        label="이미지 업로드"
        error={errors.image}
        errorMessage={'이미지를 업로드해주세요.'}
      >
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
            onPress={pickImage}
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
            onPress={takePickture}
          />
        </ThemeView>
        {form.image && (
          <Image
            source={{ uri: `data:image/jpeg;base64,${form.image}` }}
            style={styles.preview}
          />
        )}
      </FormItem>

      <ThemeView style={styles.buttonContainer}>
        <Link
          title="취소"
          href=".."
          style={[styles.cancelButton, styles.button]}
        />
        <Button
          title="요청"
          onPress={() => handleSubmit(form)}
          style={[
            styles.requestButton,
            styles.button,
            !isValid ? styles.disabledButton : {},
          ]}
          disabled={!isValid}
        />
      </ThemeView>
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

    buttonContainer: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },

    button: {
      flex: 1,
    },

    cancelButton: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    requestButton: {
      backgroundColor: COLORS[colorScheme].button,
    },

    disabledButton: {
      opacity: 0.5,
    },
  });
