import Ionicons from '@expo/vector-icons/Ionicons';
import { useFetchFriendsQuery } from '@repo/shared/hooks/useFriend';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { routineFormValidators } from '@repo/shared/service/validatorMessage';
import { getFormatDate } from '@repo/shared/utils';
import type { RoutineForm } from '@repo/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import FormButtonGroup from '@/components/routine/routine-form/form-button-group';
import { getRoutineSceneRemoteAsset } from '@/components/routine/routine-scene-art';
import {
  AutocompleteInput,
  type AutocompleteInputHandle,
  type AutocompleteItem,
} from '@/components/ui/autocomplete-input';
import Checkbox from '@/components/ui/checkbox';
import DatePickerButton from '@/components/ui/date-picker-button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import {
  DEFAULT_ROUTINE_COLOR,
  ROUTINE_COLOR_OPTIONS,
} from '@/constants/ROUTINE_COLORS';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateForm } from '@/hooks/useForm';
import { useRoutineDelete } from '@/hooks/useRoutineDelete';
import { useRoutineFormSubmission } from '@/hooks/useRoutineFormSubmission';
import {
  useBeginRoutineDateSelection,
  useClearRoutineDateSelection,
  useRoutineDateSelection,
  useRoutineForm,
  useRoutineId,
} from '@/hooks/useRoutineSelection';
import { baseFoundation, palette } from '@/theme/tokens';
import type { ModalType } from '@/types/modal';

const ROUTINE_COUNT_OPTIONS = Array.from({ length: 7 }, (_, index) => {
  const count = index + 1;

  return {
    label: `일주일에 ${count}회`,
    value: count,
  };
});

const ROUTINE_COLOR_ROWS = [
  ROUTINE_COLOR_OPTIONS.slice(0, 5),
  ROUTINE_COLOR_OPTIONS.slice(5),
];

const MAX_PENALTY = 100_000_000;

const getPenaltyDigits = (text: string) => text.replace(/[^0-9]/g, '');

const getPenaltyInputValue = (value: string | number | undefined) => {
  const digits = getPenaltyDigits(String(value ?? '')).replace(/^0+(?=\d)/, '');

  if (!digits || digits === '0') {
    return '';
  }

  const parsed = Number.parseInt(digits, 10);

  if (Number.isNaN(parsed)) {
    return '';
  }

  return String(Math.min(parsed, MAX_PENALTY));
};

const formatPenalty = (value: string | number | undefined) => {
  const penaltyValue = getPenaltyInputValue(value);

  return penaltyValue ? Number(penaltyValue).toLocaleString('ko-KR') : '0';
};

const getStartOfToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  return today;
};

type RoutineStatusForm = RoutineForm & {
  paused?: boolean;
  hidden?: boolean;
  isDailyRepeat?: boolean;
};

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<RoutineStatusForm>();

const RoutineDateFormItem = () => {
  const router = useRouter();
  const { setValue } = useForm();
  const routineDateSelection = useRoutineDateSelection();
  const beginRoutineDateSelection = useBeginRoutineDateSelection();
  const clearRoutineDateSelection = useClearRoutineDateSelection();
  const confirmedStartDate = routineDateSelection?.confirmedStartDate;
  const confirmedEndDate = routineDateSelection?.confirmedEndDate;

  useEffect(() => {
    if (!confirmedStartDate) {
      return;
    }

    setValue('startDate', confirmedStartDate);
    setValue('endDate', confirmedEndDate ?? '');
    setValue('isDailyRepeat', false);
    clearRoutineDateSelection();
  }, [
    clearRoutineDateSelection,
    confirmedEndDate,
    confirmedStartDate,
    setValue,
  ]);

  return (
    <FormItem
      name="startDate"
      label="루틴 기간"
      item={({ value, form, setValue: setFieldValue }) => (
        <ThemeView style={styles.dateSection} transparent>
          <ThemeView
            style={styles.dailyRepeatControl}
            transparent
            testID="routine-daily-repeat-control"
          >
            <Checkbox
              size="md"
              disableText
              fillColor={palette.white}
              checkedColor={palette.theme.gray[95]}
              isChecked={Boolean(form.isDailyRepeat)}
              onPress={(checked) => {
                setFieldValue('isDailyRepeat', checked);
              }}
            />
            <Pressable
              hitSlop={baseFoundation.spacing[1]}
              onPress={() => {
                setFieldValue('isDailyRepeat', !form.isDailyRepeat);
              }}
            >
              <Typography
                variant="body2"
                weight="regular"
                style={styles.dailyRepeatLabel}
              >
                매일 반복
              </Typography>
            </Pressable>
          </ThemeView>
          <ThemeView style={styles.dateContainer} transparent>
            <DatePickerButton
              testID={
                form.isDailyRepeat
                  ? 'routine-daily-repeat-date-button'
                  : 'routine-date-button'
              }
              buttonTitle={
                value
                  ? `${value}${form.endDate ? ` ~ ${form.endDate}` : ''}`
                  : '날짜 선택'
              }
              variant="outlined"
              disabled={Boolean(form.isDailyRepeat)}
              onPress={() => {
                beginRoutineDateSelection(value || null, form.endDate || null);
                router.push('/routine-date-select');
              }}
              buttonStyle={[
                styles.button,
                form.isDailyRepeat && styles.disabledDateButton,
              ]}
            />
          </ThemeView>
        </ThemeView>
      )}
      required
    />
  );
};

const RoutineFormModal = () => {
  const { type } = useLocalSearchParams<{ type: ModalType }>();
  const { theme } = useAppTheme();
  const mateAutocompleteRef = useRef<AutocompleteInputHandle>(null);
  const isRoutineAdd = type === 'routine-add';
  const defaultStartDate = useMemo(() => getFormatDate(getStartOfToday()), []);

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
  const normalizedRoutineForm = useMemo<RoutineStatusForm>(() => {
    const formWithColor = {
      ...sourceRoutineForm,
      startDate: sourceRoutineForm.startDate || defaultStartDate,
      symbolColor: sourceRoutineForm.symbolColor || DEFAULT_ROUTINE_COLOR,
      isDailyRepeat:
        !isRoutineAdd &&
        Boolean(sourceRoutineForm.startDate && !sourceRoutineForm.endDate),
    };

    return isDirectRoutine
      ? {
          ...formWithColor,
          isMe: true,
          mateNickname: '',
        }
      : formWithColor;
  }, [defaultStartDate, isDirectRoutine, isRoutineAdd, sourceRoutineForm]);
  const initialMateNickname = String(normalizedRoutineForm.mateNickname ?? '');

  const [mateKeyword, setMateKeyword] = useState('');
  const [showHiddenRoutineInfo, setShowHiddenRoutineInfo] = useState(false);
  const { deleteRoutineById } = useRoutineDelete(routineId, user!.nickname);
  const {
    handleCreate,
    handleUpdate,
    handleCancelChangeRequest,
    pendingChangeRequestId,
    isPending,
  } = useRoutineFormSubmission({
    nickname: user!.nickname,
    routineId,
    originalForm: isRoutineAdd ? undefined : normalizedRoutineForm,
    initialPendingChangeRequestId:
      routineDetail?.hasPendingChangeRequest === true
        ? routineDetail.pendingChangeRequestId
        : null,
  });

  const debouncedMateKeyword = useDebounce(mateKeyword, 300);
  const { data: friendList = [], isLoading: isFriendListLoading } =
    useFetchFriendsQuery({
      keyword: debouncedMateKeyword,
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
      friendList.map((friend) => {
        const characterAsset = getRoutineSceneRemoteAsset(
          friend.characterImageUrl,
        );

        return {
          label: friend.nickname,
          value: friend.nickname,
          imageSource: characterAsset?.source,
        };
      }),
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
        onTouchStart={() => mateAutocompleteRef.current?.dismiss()}
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
          name="symbolColor"
          label="컬러"
          item={({ value, setValue }) => (
            <View style={styles.colorGrid}>
              {ROUTINE_COLOR_ROWS.map((row, rowIndex) => (
                <View
                  key={row[0].value}
                  testID={`routine-color-row-${rowIndex}`}
                  style={styles.colorRow}
                >
                  {row.map((option) => {
                    const isSelected = value === option.value;
                    const swatchColor = option.value;

                    return (
                      <Pressable
                        key={option.value}
                        testID={`routine-color-option-${option.value.slice(1)}`}
                        accessibilityRole="radio"
                        accessibilityLabel={`컬러 ${option.label} ${
                          isSelected ? '선택됨' : '선택'
                        }`}
                        accessibilityState={{ selected: isSelected }}
                        style={[
                          styles.colorOption,
                          { backgroundColor: swatchColor },
                          isSelected && styles.colorOptionSelected,
                        ]}
                        onPress={() => setValue('symbolColor', option.value)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          )}
          required
        />
        <RoutineDateFormItem />
        <FormItem
          name="routineCount"
          label="루틴 횟수"
          item={({ value, setValue }) => (
            <Select<number>
              value={value ? Number(value) : undefined}
              items={ROUTINE_COUNT_OPTIONS}
              placeholder="루틴 횟수를 선택하세요."
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
          label="설명"
          optionalLabel="선택"
          item={({ value, onChange }) => (
            <Input
              variant="filled"
              value={value !== undefined ? String(value) : value}
              placeholder="루틴 설명을 입력하세요."
              onChangeText={onChange}
            />
          )}
        />
        {isRoutineAdd ? (
          <FormItem
            name="isMe"
            showErrors={false}
            item={({ value: isMe, setValue }) => (
              <ThemeView style={styles.mateSection} transparent>
                <ThemeView style={styles.mateField} transparent>
                  <Checkbox
                    size="md"
                    text="메이트에게 루틴 인증 요청"
                    labelColor={theme.colors.field.label}
                    fillColor={palette.theme.gray[95]}
                    isChecked={!isMe}
                    onPress={(checked) => {
                      setValue('isMe', !checked);

                      if (!checked) {
                        setValue('mateNickname', '');
                        setMateKeyword('');
                      }
                    }}
                  />
                </ThemeView>
                {!isMe && (
                  <>
                    <FormItem
                      name="mateNickname"
                      label="체크해줄 친구"
                      required
                      item={({ value, onChange }) => (
                        <AutocompleteInput
                          ref={mateAutocompleteRef}
                          interactionMode="button"
                          variant="filled"
                          value={value !== undefined ? String(value) : value}
                          placeholder="친구를 선택하세요"
                          dropdownInput={{
                            value: mateKeyword,
                            placeholder: '검색',
                            onChangeText: setMateKeyword,
                          }}
                          onDropdownDismiss={() => setMateKeyword('')}
                          editable
                          items={friendAutocompleteItems}
                          loading={isFriendListLoading}
                          onSelectItem={(item) => {
                            onChange(item.value);
                          }}
                          showDropdown
                          emptyMessage="친구를 찾을 수 없습니다."
                        />
                      )}
                    />
                    <FormItem
                      name="penalty"
                      label="벌금"
                      optionalLabel="선택"
                      item={({ value, onChange }) => (
                        <Input
                          variant="filled"
                          testID="penalty-input"
                          containerTestID="penalty-input-container"
                          value={getPenaltyInputValue(value)}
                          inputStyle={styles.penaltyInput}
                          displayFormatter={formatPenalty}
                          displayValueTestID="penalty-input-display"
                          suffix="원"
                          suffixTestID="penalty-unit"
                          onChangeText={(text) =>
                            onChange(getPenaltyInputValue(text))
                          }
                          keyboardType="number-pad"
                        />
                      )}
                    />
                  </>
                )}
              </ThemeView>
            )}
          />
        ) : initialMateNickname ? (
          <FormItem
            name="mateNickname"
            label="메이트"
            required
            showErrors={false}
            item={({ value }) => (
              <Typography variant="body">{String(value)}</Typography>
            )}
          />
        ) : null}
        {!isRoutineAdd && initialMateNickname && (
          <FormItem
            name="penalty"
            label="벌금"
            optionalLabel="선택"
            item={({ value, onChange }) => (
              <Input
                variant="filled"
                testID="penalty-input"
                containerTestID="penalty-input-container"
                value={getPenaltyInputValue(value)}
                inputStyle={styles.penaltyInput}
                displayFormatter={formatPenalty}
                displayValueTestID="penalty-input-display"
                suffix="원"
                suffixTestID="penalty-unit"
                onChangeText={(text) => onChange(getPenaltyInputValue(text))}
                keyboardType="number-pad"
              />
            )}
          />
        )}
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
            {!isRoutineAdd && (
              <ThemeView style={styles.statusOption} transparent>
                <FormItem
                  name="paused"
                  showErrors={false}
                  item={({ value, setValue }) => (
                    <ThemeView style={styles.statusCheckboxControl} transparent>
                      <Checkbox
                        size="md"
                        text="루틴 일시정지"
                        labelColor={theme.colors.text.gray}
                        isChecked={!!value}
                        onPress={(checked) => {
                          setValue('paused', checked);
                        }}
                      />
                    </ThemeView>
                  )}
                />
              </ThemeView>
            )}
            <ThemeView style={styles.statusOption} transparent>
              <FormItem
                name="hidden"
                showErrors={false}
                item={({ value, setValue }) => (
                  <ThemeView style={styles.hiddenStatusControl} transparent>
                    {showHiddenRoutineInfo && (
                      <Pressable
                        accessibilityLabel="비공개 루틴 안내 닫기"
                        accessibilityRole="button"
                        style={styles.hiddenRoutineInfoBackdrop}
                        onPress={() => setShowHiddenRoutineInfo(false)}
                      />
                    )}
                    <ThemeView
                      testID="hidden-routine-label-row"
                      style={styles.hiddenRoutineLabelRow}
                      transparent
                    >
                      <Checkbox
                        size="md"
                        disableText
                        isChecked={!!value}
                        onPress={(checked) => {
                          setValue('hidden', checked);
                        }}
                      />
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: !!value }}
                        hitSlop={theme.foundation.spacing[1]}
                        onPress={() => {
                          setValue('hidden', !value);
                        }}
                      >
                        <Typography
                          testID="hidden-routine-label"
                          variant="body2"
                          weight="semibold"
                          color={theme.colors.text.gray}
                          style={styles.hiddenRoutineLabel}
                        >
                          비공개 루틴
                        </Typography>
                      </Pressable>
                      <View style={styles.hiddenRoutineHelpContainer}>
                        <Pressable
                          accessibilityLabel="비공개 루틴 안내 보기"
                          accessibilityRole="button"
                          accessibilityState={{
                            expanded: showHiddenRoutineInfo,
                          }}
                          hitSlop={theme.foundation.spacing[2]}
                          style={styles.hiddenRoutineHelpButton}
                          onPress={() => {
                            setShowHiddenRoutineInfo((visible) => !visible);
                          }}
                        >
                          <Ionicons
                            accessibilityElementsHidden
                            testID="hidden-routine-help-icon"
                            name="help-circle-outline"
                            size={theme.foundation.iconSize.m}
                            color={theme.colors.text.gray}
                          />
                        </Pressable>
                        {showHiddenRoutineInfo && (
                          <View
                            testID="hidden-routine-info-popover"
                            style={styles.hiddenRoutineInfoPopover}
                          >
                            <Typography
                              variant="caption2"
                              weight="regular"
                              style={styles.hiddenRoutineInfoText}
                            >
                              메이트에게는 공개됩니다
                            </Typography>
                          </View>
                        )}
                      </View>
                    </ThemeView>
                  </ThemeView>
                )}
              />
            </ThemeView>
          </ThemeView>
          {!isRoutineAdd && (
            <Pressable
              accessibilityRole="button"
              testID="routine-delete-button"
              style={styles.deleteButton}
              onPress={handleDeleteRoutine}
            >
              <Text style={styles.deleteButtonText}>루틴 삭제</Text>
            </Pressable>
          )}
        </ThemeView>
      </KeyboardAwareScrollView>
      <FormButtonGroup
        type={type}
        useForm={useForm}
        hasPendingChangeRequest={pendingChangeRequestId !== null}
        isPending={isPending}
        onCancelChangeRequest={handleCancelChangeRequest}
      />
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
    paddingBottom: theme.foundation.spacing[6],
  },

  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateSection: {
    gap: theme.foundation.spacing[3],
  },

  dailyRepeatControl: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },

  dailyRepeatLabel: {
    color: theme.colors.field.label,
    lineHeight: baseFoundation.dimension.x18,
  },

  disabledDateButton: {
    backgroundColor: palette.theme.gray[5],
    borderColor: palette.theme.gray[10],
  },

  button: {
    flex: 1,
  },

  colorGrid: {
    rowGap: theme.foundation.spacing[4],
  },

  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },

  colorOptionSelected: {
    borderWidth: 3,
    borderColor: palette.white,
  },

  mateSection: {
    gap: theme.foundation.spacing[6],
  },

  mateField: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[1],
    alignItems: 'center',
  },

  penaltyInput: {
    textAlign: 'right',
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
  hiddenStatusControl: {
    alignItems: 'flex-start',
  },
  hiddenRoutineLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.dimension.x7,
    zIndex: baseFoundation.zIndex.tooltip,
  },
  hiddenRoutineLabel: {
    lineHeight: theme.foundation.dimension.x18,
  },
  hiddenRoutineInfoBackdrop: {
    position: 'absolute',
    top: -1000,
    right: -1000,
    bottom: -1000,
    left: -1000,
    zIndex: baseFoundation.zIndex.tooltip - 1,
  },
  hiddenRoutineHelpContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  hiddenRoutineHelpButton: {
    width: theme.foundation.dimension.x24,
    height: theme.foundation.dimension.x24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenRoutineInfoPopover: {
    position: 'absolute',
    top: baseFoundation.dimension.x24 + baseFoundation.spacing[0.5],
    left: -baseFoundation.spacing[2],
    width: 220,
    paddingHorizontal: baseFoundation.spacing[2.5],
    paddingVertical: baseFoundation.spacing[2],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.feedback.info.border,
    borderRadius: theme.foundation.radii.xs,
    backgroundColor: theme.colors.feedback.info.bg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
    zIndex: baseFoundation.zIndex.tooltip,
  },
  hiddenRoutineInfoText: {
    color: theme.colors.feedback.info.text,
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
