import { useFetchFriendsQuery } from '@repo/shared/hooks/useFriend';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { routineFormValidators } from '@repo/shared/service/validatorMessage';
import { getFormatDate } from '@repo/shared/utils';
import type { RoutineForm } from '@repo/types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { RoutinePeriodWarningIcon } from '@/components/icons/routine-period-warning-icon';
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
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateForm } from '@/hooks/useForm';
import { useRoutineDelete } from '@/hooks/useRoutineDelete';
import { useRoutineFormSubmission } from '@/hooks/useRoutineFormSubmission';
import { useRoutineForm, useRoutineId } from '@/hooks/useRoutineSelection';
import { baseFoundation, palette } from '@/theme/tokens';
import type { ModalType } from '@/types/modal';

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

type RoutineStatusForm = RoutineForm & {
  paused?: boolean;
  hidden?: boolean;
};

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<RoutineStatusForm>();

const RoutineFormModal = () => {
  const { type } = useLocalSearchParams<{ type: ModalType }>();
  const isRoutineAdd = type === 'routine-add';

  const routineId = useRoutineId();
  const routineForm = useRoutineForm();
  const user = useAuthUser();
  const { data: routineDetail } = useRoutineDetailQuery(
    isRoutineAdd ? 0 : routineId,
  );
  const sourceRoutineForm = !isRoutineAdd
    ? (routineDetail ?? routineForm)
    : routineForm;
  const isDirectRoutine =
    sourceRoutineForm.isMe ||
    (!!sourceRoutineForm.mateNickname &&
      sourceRoutineForm.mateNickname === user?.nickname);
  const normalizedRoutineForm = useMemo<RoutineStatusForm>(
    () =>
      isDirectRoutine
        ? {
            ...sourceRoutineForm,
            isMe: true,
            mateNickname: '',
          }
        : sourceRoutineForm,
    [isDirectRoutine, sourceRoutineForm],
  );
  const initialMateNickname = String(normalizedRoutineForm.mateNickname ?? '');

  const [mateKeyword, setMateKeyword] = useState(() =>
    normalizedRoutineForm.isMe ? '' : initialMateNickname,
  );
  useEffect(() => {
    setMateKeyword(normalizedRoutineForm.isMe ? '' : initialMateNickname);
  }, [initialMateNickname, normalizedRoutineForm.isMe]);
  const today = useMemo(() => getStartOfToday(), []);

  const { deleteRoutineById } = useRoutineDelete(routineId, user!.nickname);
  const { handleCreate, handleUpdate } = useRoutineFormSubmission({
    nickname: user!.nickname,
    routineId,
    originalForm: isRoutineAdd ? undefined : sourceRoutineForm,
  });

  // Debounce keyword for friend search
  const debouncedKeyword = useDebounce(mateKeyword, 300);

  // Fetch friends with debounced keyword
  const { data: friendList = [], isLoading: isFriendListLoading } =
    useFetchFriendsQuery({
      keyword: debouncedKeyword,
      page: 1,
    });

  const validators = useMemo(
    () => ({
      ...routineFormValidators,
      mateNickname(value: RoutineForm['mateNickname'], values: RoutineForm) {
        if (values.isMe) {
          return undefined;
        }

        if (!value) {
          return '메이트를 설정해주세요.';
        }

        if (!isRoutineAdd && value === initialMateNickname) {
          return undefined;
        }

        if (!friendList.some(({ nickname }) => nickname === value)) {
          return '존재하지 않는 친구입니다.';
        }

        return undefined;
      },
    }),
    [friendList, initialMateNickname, isRoutineAdd],
  );

  const handleDeleteRoutine = () => {
    Alert.alert('루틴 삭제', '삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: deleteRoutineById,
      },
    ]);
  };

  // Convert friend list to autocomplete items
  const friendAutocompleteItems: AutocompleteItem[] = useMemo(
    () =>
      friendList.map((friend) => ({
        label: friend.nickname,
        value: friend.nickname,
      })),
    [friendList],
  );

  if (!isRoutineAdd && routineId > 0 && !routineDetail) {
    return null;
  }

  return (
    <Form
      form={normalizedRoutineForm}
      style={styles.container}
      validators={validators}
      onSubmit={isRoutineAdd ? handleCreate : handleUpdate}
    >
      <KeyboardAwareScrollView
        testID="routine-form-scroll"
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
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
          tooltipIcon={<RoutinePeriodWarningIcon />}
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
                  minimumDate={getDateFromFormValue(form.startDate) ?? today}
                  defaultDate={getDateFromFormValue(form.startDate) ?? today}
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
                  size="md"
                  isChecked={!!form.isMe}
                  onPress={(chcked) => {
                    setValue('isMe', chcked);

                    if (chcked) {
                      setValue('mateNickname', '');
                      setMateKeyword('');
                    }
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
        {!isRoutineAdd && (
          <ThemeView
            testID="routine-status-section"
            style={styles.statusSection}
            transparent
          >
            <ThemeView
              testID="routine-status-options"
              style={styles.statusOptions}
              transparent
            >
              <ThemeView style={styles.statusOption} transparent>
                <FormItem
                  name="paused"
                  showErrors={false}
                  item={({ value, setValue }) => (
                    <ThemeView style={styles.statusCheckboxControl} transparent>
                      <Checkbox
                        size="md"
                        disableText
                        isChecked={!!value}
                        onPress={(checked) => {
                          setValue('paused', checked);
                        }}
                      />
                      <Typography
                        variant="body2"
                        weight="semibold"
                        color={palette.theme.gray[90]}
                        style={styles.statusCheckboxLabel}
                      >
                        루틴 일시정지
                      </Typography>
                    </ThemeView>
                  )}
                />
              </ThemeView>
              <ThemeView style={styles.statusOption} transparent>
                <FormItem
                  name="hidden"
                  showErrors={false}
                  item={({ value, setValue }) => (
                    <ThemeView style={styles.statusCheckboxControl} transparent>
                      <Checkbox
                        size="md"
                        disableText
                        isChecked={!!value}
                        onPress={(checked) => {
                          setValue('hidden', checked);
                        }}
                      />
                      <Typography
                        variant="body2"
                        weight="semibold"
                        color={palette.theme.gray[90]}
                        style={styles.statusCheckboxLabel}
                      >
                        루틴 숨김
                      </Typography>
                    </ThemeView>
                  )}
                />
              </ThemeView>
            </ThemeView>
            <Pressable
              accessibilityRole="button"
              testID="routine-delete-button"
              style={styles.deleteButton}
              onPress={handleDeleteRoutine}
            >
              <Text style={styles.deleteButtonText}>루틴 삭제</Text>
            </Pressable>
          </ThemeView>
        )}
      </KeyboardAwareScrollView>
      <FormButtonGroup type={type} useForm={useForm} />
    </Form>
  );
};

export default RoutineFormModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    marginTop: theme.foundation.spacing[4],
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    gap: theme.foundation.spacing[6],
    paddingBottom: baseFoundation.dimension.x112,
  },

  date: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[3],
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
    gap: theme.foundation.spacing[1],
    alignItems: 'center',
  },

  statusSection: {
    gap: 40,
    marginTop: 16,
    paddingBottom: 20,
  },

  statusOptions: {
    alignItems: 'flex-start',
    gap: 16,
  },

  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[3],
  },
  statusCheckboxControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },
  statusCheckboxLabel: {
    color: palette.theme.gray[90],
  },

  deleteButton: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.theme.red[50],
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButtonText: {
    color: palette.theme.red[50],
    fontSize: baseFoundation.typography.size.body3,
    fontWeight: baseFoundation.typography.weight.regular,
  },
}));
