import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { RoutineForm } from '@repo/types';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useForm } from '@/hooks/useForm';
import { ModalType } from '@/hooks/useModal';
import {
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
} from '@repo/shared/hooks/useRoutine';
import { useRoutineStore } from '@/store/routine.store';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { COLORS } from '@/theme/colors';
import { getFormatDate } from '@/utils/date-utils';

import { Button } from '../common/Button';
import FormItem from '../common/form/FormItem';
import Link from '../common/Link';
import ThemeText from '../common/ThemeText';
import ThemeTextInput from '../common/ThemeTextInput';
import ThemeView from '../common/ThemeView';

const RoutineFormModal = () => {
  const { type } = useLocalSearchParams<{ type: ModalType }>();

  const [routineId, routineForm] = useRoutineStore((state) => [
    state.routineId,
    state.routineForm,
  ]);
  const { form, errors, handleChange, touched, validate } =
    useForm<RoutineForm>({
      initialState: routineForm,
      validator: {
        routineName: { required: true },
        routineDetail: { required: true },
        penalty: { required: true, min: 0 },
        routineCount: { required: true, min: 1, max: 7 },
        startDate: { required: true },
      },
    });

  const [isShowStartDate, setIsShowStartDate] = useState(false);
  const [isShowEndDate, setIsShowEndDate] = useState(false);

  const { user } = useAuthStore();
  const saveMutation = useCreateRoutineMutation(user!.name);
  const updateMutation = useUpdateRoutineMutation();

  const router = useRouter();

  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const isValid = validate(form);

  const handleSubmit = async (data: RoutineForm) => {
    try {
      await saveMutation.mutateAsync({
        ...data,
        nickname: user!.name,
        mateNickname: user!.name === 'yunji' ? 'moon' : 'yunji',
      });

      alert('루틴이 생성되었습니다.');
      router.back();
    } catch {
      alert('루틴 생성에 실패했습니다.');
    }
  };

  const handleUpdateSubmit = async (data: RoutineForm) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        routineId,
        nickname: user!.name,
        mateNickname: user!.name === 'yunji' ? 'moon' : 'yunji',
      });

      alert('루틴이 수정되었습니다.');
      router.back();
    } catch {
      alert('루틴 수정에 실패했습니다.');
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <ThemeView style={styles.container}>
        <FormItem
          label="루틴 이름"
          error={errors.routineName}
          errorMessage={'루틴 이름을 입력해주세요.'}
          touched={touched.routineName}
        >
          <ThemeTextInput
            placeholder="루틴 이름을 입력해주세요."
            defaultValue={form.routineName}
            onChangeText={(text) => handleChange('routineName', text)}
          />
        </FormItem>
        <FormItem
          label="루틴 설명"
          error={errors.routineDetail}
          errorMessage={'루틴 설명을 입력해주세요.'}
          touched={touched.routineDetail}
        >
          <ThemeTextInput
            placeholder="루틴 설명을 입력해주세요."
            defaultValue={form.routineDetail}
            onChangeText={(text) => handleChange('routineDetail', text)}
          />
        </FormItem>
        <FormItem
          label="벌금"
          error={errors.penalty}
          errorMessage={'벌금을 입력해주세요.'}
          touched={touched.penalty}
        >
          <ThemeTextInput
            placeholder="벌금을 입력해주세요."
            defaultValue={form.penalty.toString()}
            onChangeText={(text) => handleChange('penalty', text)}
            keyboardType="number-pad"
          />
        </FormItem>
        <FormItem
          label="루틴 횟수"
          error={errors.routineCount}
          errorMessage={'루틴 횟수를 입력해주세요.'}
          touched={touched.routineCount}
        >
          <ThemeTextInput
            placeholder="루틴 횟수를 입력해주세요."
            defaultValue={form.routineCount.toString()}
            onChangeText={(text) => handleChange('routineCount', text)}
            keyboardType="number-pad"
          />
        </FormItem>
        <FormItem
          label="루틴 시작 날짜"
          error={errors.startDate}
          errorMessage={'루틴 시작 날짜를 입력해주세요.'}
          touched={touched.startDate}
        >
          <ThemeView style={styles.dateContainer}>
            {form.startDate && <ThemeText>{form.startDate}</ThemeText>}
            <Button
              title="날짜 선택"
              fontSize="caption"
              onPress={() => setIsShowStartDate(true)}
              style={styles.date_button}
              icon={
                <Ionicons
                  name="calendar-clear-outline"
                  size={16}
                  color={COLORS.dark.icon}
                  style={{ marginRight: 3 }}
                />
              }
            />
          </ThemeView>

          {isShowStartDate && (
            <DateTimePicker
              initialInputMode="keyboard"
              value={form.startDate ? new Date(form.startDate) : new Date()}
              mode="date"
              onChange={(event, startDate = new Date()) => {
                handleChange('startDate', getFormatDate(startDate));

                const endDate = new Date(form.endDate || startDate);

                if (form.endDate && endDate < startDate) {
                  handleChange('endDate', getFormatDate(startDate));
                }
                setIsShowStartDate(false);
              }}
            />
          )}
        </FormItem>
        <FormItem label="루틴 종료 날짜">
          <ThemeView style={styles.dateContainer}>
            {form.endDate && <ThemeText>{form.endDate}</ThemeText>}
            <Button
              title="날짜 선택"
              fontSize="caption"
              onPress={() => setIsShowEndDate(true)}
              style={styles.date_button}
              icon={
                <Ionicons
                  name="calendar-clear-outline"
                  size={16}
                  color={COLORS.dark.icon}
                  style={{ marginRight: 3 }}
                />
              }
            />
          </ThemeView>

          {isShowEndDate && (
            <DateTimePicker
              value={form.endDate ? new Date(form.endDate) : new Date()}
              mode="date"
              onChange={(event, endDate = new Date()) => {
                handleChange('endDate', getFormatDate(endDate));

                const startDate = new Date(form.startDate);

                if (form.startDate && startDate > endDate) {
                  handleChange('startDate', getFormatDate(endDate));
                }
                setIsShowEndDate(false);
              }}
            />
          )}
        </FormItem>
        <ThemeView style={styles.buttonContainer}>
          <Link
            title="취소"
            href=".."
            style={[styles.cancelButton, styles.button]}
          />
          {type === 'routine-add' ? (
            <Button
              title="추가"
              onPress={() => handleSubmit(form)}
              style={[
                styles.addButton,
                styles.button,
                !isValid ? styles.disabledButton : {},
              ]}
              disabled={!isValid}
            />
          ) : (
            <Button
              title="수정"
              onPress={() => handleUpdateSubmit(form)}
              style={[
                styles.addButton,
                styles.button,
                !isValid ? styles.disabledButton : {},
              ]}
              disabled={!isValid}
            />
          )}
        </ThemeView>
      </ThemeView>
    </KeyboardAwareScrollView>
  );
};

export default RoutineFormModal;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 30,
      gap: 20,
      paddingHorizontal: 10,
    },

    buttonContainer: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },

    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    date_button: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    button: {
      flex: 1,
    },

    cancelButton: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    addButton: {
      backgroundColor: COLORS[colorScheme].button,
    },

    disabledButton: {
      opacity: 0.5,
    },
  });
