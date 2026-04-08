import Ionicons from '@expo/vector-icons/Ionicons';
import type { FormContextType } from '@repo/shared/components';
import { useFetchRewardsQuery } from '@repo/shared/hooks/useQuest';
import { getMondayDate, getNextMonday } from '@repo/shared/utils';
import type { CreateQuestForm, VerificationType } from '@repo/types';
import { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StyleSheet, type UnistylesThemes } from 'react-native-unistyles';

import QuestStartDateCalendar from '@/components/quest/quest-start-date-calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SelectItem } from '@/components/ui/select';
import { Select } from '@/components/ui/select';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useCreateForm } from '@/hooks/useForm';
import { useQuestFormSubmission } from '@/hooks/useQuestFormSubmission';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<CreateQuestForm>();

// 인증 유형 옵션
const VERIFICATION_TYPE_OPTIONS: SelectItem<VerificationType>[] = [
  { label: '주간 앱 방문', value: 'WEEKLY_APP_VISIT' },
  { label: '주간 메이트 루틴 리뷰', value: 'WEEKLY_MATE_ROUTINE_REVIEW' },
  { label: '주간 본인 루틴 인증', value: 'WEEKLY_SELF_ROUTINE_PASS' },
];

// 제출 버튼 컴포넌트 (useForm을 props로 받음)
interface QuestFormButtonGroupProps {
  useQuestForm: () => FormContextType<CreateQuestForm>;
  loading: boolean;
}

const QuestFormButtonGroup = ({
  useQuestForm,
  loading,
}: QuestFormButtonGroupProps) => {
  const { handleSubmit } = useQuestForm();

  return (
    <ThemeView style={styles.buttonContainer}>
      <Button
        title="생성하기"
        variant="primary"
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
      />
    </ThemeView>
  );
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// ISO 8601 형식으로 변환 (밀리초 제거, 초 단위까지만)
const toISOStringWithoutMs = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const getStartOfDay = (date: Date) => {
  const normalizedDate = new Date(date);

  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

const getQuestStartMonday = (date: Date) => {
  return getStartOfDay(getMondayDate(date));
};

const getFirstSelectableMonday = () => {
  return getStartOfDay(getNextMonday(new Date()));
};

const sanitizeNumericInput = (text: string): string => {
  return text.replace(/[^0-9]/g, '');
};

const QuestFormModal = () => {
  const [isShowStartDate, setIsShowStartDate] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);

  const { data: rewards = [] } = useFetchRewardsQuery();
  const { handleSubmit, isPending } = useQuestFormSubmission();

  // 보상 옵션 생성
  const rewardOptions: SelectItem<number>[] = rewards.map((reward) => ({
    label: reward.rewardName,
    value: reward.rewardId,
    description: `${reward.rewardType} - ${reward.expAmount}EXP`,
  }));

  // 초기 폼 값
  const initialForm: Partial<CreateQuestForm> = {
    questName: '',
    questType: 'WEEKLY',
    description: '',
    rewardId: undefined,
    startDate: '',
    requiredLevel: undefined,
    maxParticipants: undefined,
    verificationType: undefined,
    verificationTargetCount: undefined,
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      enableResetScrollToCoords={false}
    >
      <Form
        form={initialForm as CreateQuestForm}
        style={styles.container}
        validators={{
          questName: (value) => {
            if (!value) return '퀘스트 이름을 입력해주세요.';
            if (value.length > 100) return '100자 이하로 입력해주세요.';
            return undefined;
          },
          description: (value) => {
            if (!value) return '퀘스트 설명을 입력해주세요.';
            if (value.length > 500) return '500자 이하로 입력해주세요.';
            return undefined;
          },
          rewardId: (value) => {
            if (!value) return '보상을 선택해주세요.';
            return undefined;
          },
          startDate: (value) => {
            if (!value) return '시작 날짜를 선택해주세요.';
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(value);

            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
              return '시작 날짜는 오늘 이후여야 합니다.';
            }
            return undefined;
          },
          requiredLevel: (value) => {
            if (!value) return '필요 레벨을 입력해주세요.';
            const num = Number(value);

            if (num < 1 || num > 10000) {
              return '레벨은 1~10000 사이여야 합니다.';
            }
            return undefined;
          },
          maxParticipants: (value) => {
            if (!value) return '최대 참여자 수를 입력해주세요.';
            const num = Number(value);

            if (num < 1 || num > 10000) {
              return '참여자 수는 1~10000 사이여야 합니다.';
            }
            return undefined;
          },
          verificationType: (value) => {
            if (!value) return '인증 유형을 선택해주세요.';
            return undefined;
          },
          verificationTargetCount: (value) => {
            if (!value) return '목표 횟수를 입력해주세요.';
            const num = Number(value);

            if (num < 1) return '목표 횟수는 1 이상이어야 합니다.';
            return undefined;
          },
        }}
        onSubmit={handleSubmit}
      >
        {/* 퀘스트 이름 */}
        <FormItem
          name="questName"
          label="퀘스트 이름"
          item={({ value, onChange }) => (
            <Input
              value={value !== undefined ? String(value) : ''}
              placeholder="퀘스트 이름을 입력하세요"
              onChangeText={onChange}
            />
          )}
        />

        {/* 퀘스트 설명 */}
        <FormItem
          name="description"
          label="퀘스트 설명"
          item={({ value, onChange }) => (
            <Input
              value={value !== undefined ? String(value) : ''}
              placeholder="퀘스트 설명을 입력하세요"
              onChangeText={onChange}
              multiline
              style={styles.textarea}
            />
          )}
        />

        {/* 보상 */}
        <FormItem
          name="rewardId"
          label="보상"
          item={({ value, setValue }) => (
            <Select<number>
              value={value as number | undefined}
              items={rewardOptions}
              onSelect={(val) => setValue('rewardId', val)}
              placeholder="보상 선택"
            />
          )}
        />

        {/* 시작 날짜 */}
        <FormItem
          name="startDate"
          label="시작 날짜"
          helpText="퀘스트는 월요일부터 시작됩니다"
          item={({ value, form, setValue }) => (
            <ThemeView transparent>
              <ThemeView style={styles.dateTimeWrapper} transparent>
                <ThemeView style={styles.dateTimeDisplay} transparent>
                  {form.startDate && (
                    <Typography style={styles.dateTimeText} numberOfLines={1}>
                      {value ? formatDate(new Date(value)) : form.startDate}
                    </Typography>
                  )}
                  {!form.startDate && (
                    <Typography style={styles.placeholderText}>
                      날짜 미선택
                    </Typography>
                  )}
                </ThemeView>
                <Button
                  title="선택"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setTempStartDate(
                      value ? getQuestStartMonday(new Date(value)) : null,
                    );
                    setIsShowStartDate((prev) => !prev);
                  }}
                  leftIcon={({ color }) => (
                    <Ionicons
                      name="calendar-clear-outline"
                      size={16}
                      color={color}
                    />
                  )}
                  style={styles.dateButton}
                />
              </ThemeView>
              <Modal
                visible={isShowStartDate}
                animationType="slide"
                transparent
                onRequestClose={() => {
                  setIsShowStartDate(false);
                  setTempStartDate(null);
                }}
              >
                <Pressable
                  style={styles.dateSheetOverlay}
                  onPress={() => {
                    setIsShowStartDate(false);
                    setTempStartDate(null);
                  }}
                  accessibilityLabel="날짜 선택 닫기"
                >
                  <Pressable
                    style={styles.dateSheetContainer}
                    onPress={(event) => event?.stopPropagation?.()}
                  >
                    <ThemeView style={styles.dateSheetContent} transparent>
                      <ThemeView transparent style={styles.dateSheetHandle} />
                      <QuestStartDateCalendar
                        minimumDate={getFirstSelectableMonday()}
                        selectedDate={tempStartDate}
                        onSelectDate={setTempStartDate}
                        onCancel={() => {
                          setIsShowStartDate(false);
                          setTempStartDate(null);
                        }}
                        onConfirm={() => {
                          if (!tempStartDate) {
                            return;
                          }

                          setValue(
                            'startDate',
                            toISOStringWithoutMs(
                              getQuestStartMonday(tempStartDate),
                            ),
                          );

                          setIsShowStartDate(false);
                          setTempStartDate(null);
                        }}
                      />
                    </ThemeView>
                  </Pressable>
                </Pressable>
              </Modal>
            </ThemeView>
          )}
        />

        {/* 필요 레벨 */}
        <FormItem
          name="requiredLevel"
          label="필요 레벨"
          item={({ value, onChange }) => {
            const handleChange = (text: string) => {
              onChange(sanitizeNumericInput(text));
            };

            return (
              <Input
                value={value !== undefined ? String(value) : ''}
                placeholder="필요 레벨 입력 (1-10000)"
                onChangeText={handleChange}
                keyboardType="number-pad"
              />
            );
          }}
        />

        {/* 최대 참여자 */}
        <FormItem
          name="maxParticipants"
          label="최대 참여자"
          item={({ value, onChange }) => {
            const handleChange = (text: string) => {
              onChange(sanitizeNumericInput(text));
            };

            return (
              <Input
                value={value !== undefined ? String(value) : ''}
                placeholder="최대 참여자 수 입력 (1-10000)"
                onChangeText={handleChange}
                keyboardType="number-pad"
              />
            );
          }}
        />

        {/* 인증 유형 */}
        <FormItem
          name="verificationType"
          label="인증 유형"
          item={({ value, onChange }) => (
            <Select<VerificationType>
              value={value as VerificationType | undefined}
              items={VERIFICATION_TYPE_OPTIONS}
              onSelect={onChange}
              placeholder="인증 유형 선택"
            />
          )}
        />

        {/* 목표 횟수 */}
        <FormItem
          name="verificationTargetCount"
          label="목표 횟수"
          item={({ value, onChange }) => {
            const handleChange = (text: string) => {
              onChange(sanitizeNumericInput(text));
            };

            return (
              <Input
                value={value !== undefined ? String(value) : ''}
                placeholder="목표 횟수 입력 (예: 7)"
                onChangeText={handleChange}
                keyboardType="number-pad"
              />
            );
          }}
        />

        {/* 제출 버튼 */}
        <QuestFormButtonGroup useQuestForm={useForm} loading={isPending} />
      </Form>
    </KeyboardAwareScrollView>
  );
};

export default QuestFormModal;

const styles = StyleSheet.create((theme: UnistylesThemes['light']) => ({
  container: {
    flex: 1,
    marginTop: 30,
    gap: 20,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },

  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },

  dateTimeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  dateTimeDisplay: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },

  dateTimeText: {
    color: theme.colors.text.primary,
    fontSize: theme.foundation.typography.size.m,
  },

  placeholderText: {
    color: theme.colors.text.tertiary,
    fontSize: theme.foundation.typography.size.m,
  },

  dateButton: {
    minWidth: 80,
  },

  datePickerContainer: {
    marginTop: 10,
  },

  dateSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },

  dateSheetContainer: {
    width: '100%',
    paddingHorizontal: theme.foundation.spacing.m,
    paddingBottom: theme.foundation.spacing.l,
  },

  dateSheetContent: {
    gap: theme.foundation.spacing.s,
  },

  dateSheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: theme.foundation.radii.round,
    backgroundColor: theme.colors.border.strong,
    opacity: 0.7,
  },

  buttonContainer: {
    marginTop: theme.foundation.spacing.m,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  button: {
    flex: 1,
  },
}));
