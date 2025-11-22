import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
} from '@repo/shared/hooks/useRoutine';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { getFormatDate } from '@repo/shared/utils';
import { RoutineForm } from '@repo/types';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useCreateForm } from '@/hooks/useForm';
import { ModalType } from '@/hooks/useModal';
import { useRoutineStore } from '@/store/routine.store';
import { COLORS } from '@/theme/colors';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeTextInput from '../common/ThemeTextInput';
import ThemeView from '../common/ThemeView';
import FormButtonGroup from '../routine/routine-form/FormButtonGroup';
import { routineFormValidators } from '@repo/shared/service/validatorMessage';
import { useFetchFriendsQuery } from '@repo/shared/hooks/useFriend';
import Checkbox from '../common/Checkbox';

const { Form, FormItem, useForm } = useCreateForm<RoutineForm>();

const RoutineFormModal = () => {
  const { type } = useLocalSearchParams<{ type: ModalType }>();
  
  const routineId = useRoutineStore((state) => state.routineId);
  const routineForm = useRoutineStore((state) => state.routineForm);

  const [isShowStartDate, setIsShowStartDate] = useState(false);
  const [isShowEndDate, setIsShowEndDate] = useState(false);

  const { user } = useAuthStore();
  const saveMutation = useCreateRoutineMutation(user!.nickname);
  const updateMutation = useUpdateRoutineMutation(user!.nickname);

  const router = useRouter();

  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const { data: friendList = [] } = useFetchFriendsQuery();

  const handleSubmit = async (data: RoutineForm) => {
    try {
      await saveMutation.mutateAsync({
        ...data,
        nickname: user!.nickname,
        mateNickname: user!.nickname,
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
        nickname: user!.nickname,
        mateNickname: user!.nickname,
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
      <Form 
        form={routineForm} 
        style={styles.container} 
        validators={{
          ...routineFormValidators,
          mateNickname(value, values) {
            if (values.isMe) {
              return;
            }
            
            if (!value) {
              return '메이트를 설정해주세요.';
            }
        
            if (friendList.some(({ nickname }) => nickname === value)) {
              return '존재하지 않는 친구입니다.';
            }
          }
        }}
        onSubmit={type === 'routine-add' ? handleSubmit : handleUpdateSubmit}
      >
        <FormItem
          name="routineName"
          label="루틴 이름"
          children={({ value, onChange }) => (
            <ThemeTextInput
              value={value !== undefined ? String(value) : value}
              placeholder="루틴 이름을 입력하세요."
              onChangeText={onChange}
            />
          )}
        />
        <FormItem
          name="routineDetail"
          label="루틴 설명"
          children={({ value, onChange }) => (
            <ThemeTextInput
              value={value !== undefined ? String(value) : value}
              placeholder="루틴 설명을 입력해주세요."
              onChangeText={onChange}
            />
          )}
        />
        <FormItem
          name="mateNickname"
          label="메이트"
          children={({ value, onChange, form, setValue }) => (
            <>
              <ThemeView style={styles.mateField}>
                <ThemeText variant='medium'>직접 루틴 체크</ThemeText>
                <Checkbox
                  fillColor={COLORS[colorScheme].button}
                  onPress={
                    (chcked) => {
                      setValue('isMe', chcked);
                  }}
                />
              </ThemeView>
              <ThemeTextInput
                value={value !== undefined ? String(value) : value}
                placeholder="메이트를 지정해주세요."
                onChangeText={onChange}
                editable={!form.isMe}
              />
            </>
          )}
        />
        <FormItem
          name="penalty"
          label="벌금"
          children={({ value, onChange }) => {
            const formatNumber = (num: string | number) => {
              const numStr = String(num).replace(/[^0-9]/g, '');
              if (!numStr || numStr === '0') return '';
              const parsed = parseInt(numStr, 10);
              return isNaN(parsed) ? '' : parsed.toLocaleString('ko-KR');
            };

            const handleChange = (text: string) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              onChange(numericValue);
            };

            return (
              <ThemeTextInput
                value={value !== undefined ? formatNumber(value) : value}
                placeholder="벌금을 입력해주세요."
                onChangeText={handleChange}
                keyboardType="number-pad"
              />
            );
          }}
        />
        <FormItem
          name="routineCount"
          label="루틴 횟수"
          children={({ value, onChange }) => {
            const handleChange = (text: string) => {
              if (text === '') {
                onChange(text);
                return;
              }
              const num = Number(text);
              if (Number.isInteger(num) && num >= 1 && num <= 7) {
                onChange(text);
              }
            };

            return (
              <ThemeTextInput
                value={value !== undefined ? String(value) : value}
                placeholder="루틴 횟수를 입력해주세요."
                onChangeText={handleChange}
                onFocus={() => {
                  if (['0', '1'].includes(String(value))) {
                    onChange('');
                  }
                }}
                keyboardType="number-pad"
              />
            );
          }}
        />
        <FormItem
          name="startDate"
          label="루틴 시작 날짜"
          children={({ value, form, setValue }) => (
            <ThemeView style={styles.dateContainer}>
              {form.startDate && <ThemeText>{form.startDate}</ThemeText>}
              <Button
                title="날짜 선택"
                fontSize="caption"
                onPress={() => setIsShowStartDate(!isShowStartDate)}
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
              {isShowStartDate && (
                <DateTimePicker
                  themeVariant={colorScheme}
                  value={value ? new Date(value) : new Date()}
                  mode="date"
                  onChange={(_, startDate = new Date()) => {
                    setValue('startDate', getFormatDate(startDate));

                    const endDate = new Date(form.endDate || startDate);

                    if (form.endDate && endDate < startDate) {
                      setValue('endDate', getFormatDate(startDate));
                    }
                    setIsShowStartDate(false);
                  }}
                />
              )}
            </ThemeView>
          )}
        />
        <FormItem
          name="endDate"
          label="루틴 종료 날짜"
          children={({ form, setValue }) => (
            <ThemeView style={styles.dateContainer}>
              {form.endDate && <ThemeText>{form.endDate}</ThemeText>}
              <Button
                title="날짜 선택"
                fontSize="caption"
                onPress={() => setIsShowEndDate(!isShowEndDate)}
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
              {isShowEndDate && (
                <DateTimePicker
                  themeVariant={colorScheme}
                  value={form.endDate ? new Date(form.endDate) : new Date()}
                  mode="date"
                  onChange={(_, endDate = new Date()) => {
                    setValue('endDate', getFormatDate(endDate));

                    const startDate = new Date(form.startDate);

                    if (form.startDate && startDate > endDate) {
                      setValue('startDate', getFormatDate(endDate));
                    }
                    setIsShowEndDate(false);
                  }}
                />
              )}
            </ThemeView>
          )}
        />
        
        <FormButtonGroup 
          type={type}
          useForm={useForm}
        />
      </Form>
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

    mateField: {
      flexDirection: 'row',
      gap: 5,
      alignItems: 'center',
    }
  });
