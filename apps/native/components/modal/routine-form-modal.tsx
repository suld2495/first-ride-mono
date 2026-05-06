import { useFetchFriendsQuery } from '@repo/shared/hooks/useFriend';
import { routineFormValidators } from '@repo/shared/service/validatorMessage';
import { getFormatDate } from '@repo/shared/utils';
import type { RoutineForm } from '@repo/types';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import FormButtonGroup from '@/components/routine/routine-form/form-button-group';
import {
  AutocompleteInput,
  type AutocompleteItem,
} from '@/components/ui/autocomplete-input';
import Checkbox from '@/components/ui/checkbox';
import DatePicker from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateForm } from '@/hooks/useForm';
import type { ModalType } from '@/hooks/useModal';
import { useRoutineFormSubmission } from '@/hooks/useRoutineFormSubmission';
import { useRoutineForm, useRoutineId } from '@/hooks/useRoutineSelection';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<RoutineForm>();

const ROUTINE_COUNT_OPTIONS = Array.from({ length: 7 }, (_, index) => {
  const count = index + 1;

  return {
    label: `일주일에 ${count}회`,
    value: count,
  };
});

const getDateFromFormValue = (date?: string) => {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
};

const getStartOfToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  return today;
};

const RoutineFormModal = () => {
  const { type } = useLocalSearchParams<{ type: ModalType }>();

  const routineId = useRoutineId();
  const routineForm = useRoutineForm();

  const [mateKeyword, setMateKeyword] = useState('');
  const today = useMemo(() => getStartOfToday(), []);

  const user = useAuthUser();
  const { handleCreate, handleUpdate } = useRoutineFormSubmission({
    nickname: user!.nickname,
    routineId,
  });

  // Debounce keyword for friend search
  const debouncedKeyword = useDebounce(mateKeyword, 300);

  // Fetch friends with debounced keyword
  const { data: friendList = [], isLoading: isFriendListLoading } =
    useFetchFriendsQuery({
      keyword: debouncedKeyword,
      page: 1,
    });

  // Convert friend list to autocomplete items
  const friendAutocompleteItems: AutocompleteItem[] = useMemo(
    () =>
      friendList.map((friend) => ({
        label: friend.nickname,
        value: friend.nickname,
      })),
    [friendList],
  );

  return (
    <Form
      form={routineForm}
      style={styles.container}
      validators={{
        ...routineFormValidators,
        mateNickname(value, values) {
          if (values.isMe) {
            return undefined;
          }

          if (!value) {
            return '메이트를 설정해주세요.';
          }

          if (!friendList.some(({ nickname }) => nickname === value)) {
            return '존재하지 않는 친구입니다.';
          }

          return undefined;
        },
      }}
      onSubmit={type === 'routine-add' ? handleCreate : handleUpdate}
    >
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
      >
        <FormItem
          name="routineName"
          label="루틴 이름"
          item={({ value, onChange }) => (
            <Input
              variant="filled"
              size="md"
              value={value !== undefined ? String(value) : value}
              placeholder="루틴 이름을 입력하세요."
              onChangeText={onChange}
            />
          )}
          required
        />
        <FormItem
          name="startDate"
          label="루틴 기간"
          tooltipText="시작일부터 종료일까지 루틴을 진행할 기간을 선택해주세요."
          item={({ value, form, setValue }) => (
            <ThemeView style={styles.date}>
              <ThemeView style={styles.dateContainer} transparent>
                <DatePicker
                  value={getDateFromFormValue(value)}
                  buttonTitle={form.startDate || '시작일 선택'}
                  variant="outlined"
                  sheetLabel="시작일 선택"
                  minimumDate={today}
                  defaultDate={today}
                  onConfirmDate={(date) => {
                    setValue('startDate', getFormatDate(date));

                    const endDate = getDateFromFormValue(form.endDate) ?? date;

                    if (form.endDate && endDate < date) {
                      setValue('endDate', getFormatDate(date));
                    }
                  }}
                  buttonStyle={styles.button}
                />
              </ThemeView>
              <ThemeView style={styles.dateContainer} transparent>
                <DatePicker
                  value={getDateFromFormValue(form.endDate)}
                  buttonTitle={form.endDate || '종료일 선택'}
                  variant="outlined"
                  sheetLabel="종료일 선택"
                  minimumDate={
                    getDateFromFormValue(form.startDate) ?? today
                  }
                  defaultDate={
                    getDateFromFormValue(form.startDate) ?? today
                  }
                  onConfirmDate={(date) => {
                    setValue('endDate', getFormatDate(date));

                    const startDate = getDateFromFormValue(form.startDate);

                    if (startDate && startDate > date) {
                      setValue('startDate', getFormatDate(date));
                    }
                  }}
                  buttonStyle={styles.button}
                />
              </ThemeView>
            </ThemeView>
          )}
          required
        />
        <FormItem
          name="routineCount"
          label="루틴 횟수"
          item={({ value, setValue }) => (
            <Select<number>
              value={value ? Number(value) : undefined}
              items={ROUTINE_COUNT_OPTIONS}
              placeholder="루틴 횟수를 선택해주세요."
              variant="filled"
              dropdownMaxHeight={308}
              onSelect={(selectedValue) => {
                setValue('routineCount', selectedValue);
              }}
            />
          )}
          required
        />
        <FormItem
          name="routineDetail"
          label="루틴 설명"
          item={({ value, onChange }) => (
            <Input
              variant="filled"
              value={value !== undefined ? String(value) : value}
              placeholder="루틴 설명을 입력해주세요."
              onChangeText={onChange}
            />
          )}
        />
        <FormItem
          name="mateNickname"
          label="메이트"
          item={({ value, onChange, form, setValue }) => (
            <>
              <ThemeView style={styles.mateField} transparent>
                <Typography variant="body">직접 루틴 체크</Typography>
                <Checkbox
                  onPress={(chcked) => {
                    setValue('isMe', chcked);
                  }}
                />
              </ThemeView>
              <AutocompleteInput
                variant="filled"
                value={value !== undefined ? String(value) : value}
                placeholder="메이트를 지정해주세요."
                onChangeText={(text) => {
                  onChange(text);
                  setMateKeyword(text);
                }}
                editable={!form.isMe}
                items={friendAutocompleteItems}
                loading={isFriendListLoading}
                onSelectItem={(item) => {
                  onChange(item.value);
                  setMateKeyword('');
                }}
                showDropdown={!form.isMe && mateKeyword.length > 0}
                emptyMessage="친구를 찾을 수 없습니다."
              />
            </>
          )}
        />
        <FormItem
          name="penalty"
          label="벌금"
          item={({ value, onChange }) => {
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
              <Input
                variant="filled"
                value={value !== undefined ? formatNumber(value) : value}
                placeholder="벌금을 입력해주세요."
                onChangeText={handleChange}
                keyboardType="number-pad"
              />
            );
          }}
        />
      </KeyboardAwareScrollView>
      <FormButtonGroup type={type} useForm={useForm} />
    </Form>
  );
};

export default RoutineFormModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    marginTop: theme.foundation.spacing.m,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    gap: theme.foundation.spacing.l,
    paddingBottom: theme.foundation.spacing.xl,
  },

  date: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing.sm,
  },

  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  button: {
    flex: 1,
  },

  mateField: {
    flexDirection: 'row',
    gap: theme.foundation.spacing.xs,
    alignItems: 'center',
  },
}));
