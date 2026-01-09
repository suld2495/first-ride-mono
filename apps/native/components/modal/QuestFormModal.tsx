import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FormContextType } from '@repo/shared/components';
import {
  useCreateQuestMutation,
  useFetchRewardsQuery,
} from '@repo/shared/hooks/useQuest';
import { QuestForm } from '@repo/types';
import { useRouter } from 'expo-router';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select, SelectItem } from '@/components/common/Select';
import ThemeView from '@/components/common/ThemeView';
import { Typography } from '@/components/common/Typography';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCreateForm } from '@/hooks/useForm';
import { getApiErrorMessage } from '@/utils/error-utils';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<QuestForm>();

// 퀘스트 타입 옵션
const QUEST_TYPE_OPTIONS: SelectItem<'DAILY' | 'WEEKLY'>[] = [
  { label: '일일 퀘스트', value: 'DAILY' },
  { label: '주간 퀘스트', value: 'WEEKLY' },
];

// 제출 버튼 컴포넌트 (useForm을 props로 받음)
interface QuestFormButtonGroupProps {
  useForm: () => FormContextType<QuestForm>;
  loading: boolean;
}

const QuestFormButtonGroup = ({
  useForm,
  loading,
}: QuestFormButtonGroupProps) => {
  const { handleSubmit } = useForm();

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

// 날짜/시간 포맷 헬퍼
const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
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

const QuestFormModal = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();

  const [isShowStartDate, setIsShowStartDate] = useState(false);
  const [isShowEndDate, setIsShowEndDate] = useState(false);

  // Mutations & Queries
  const createQuestMutation = useCreateQuestMutation();
  const { data: rewards = [] } = useFetchRewardsQuery();

  // 보상 옵션 생성
  const rewardOptions: SelectItem<number>[] = rewards.map((reward) => ({
    label: reward.rewardName,
    value: reward.rewardId,
    description: `${reward.rewardType} - ${reward.expAmount}EXP`,
  }));

  // 폼 제출 핸들러
  const handleSubmit = async (data: QuestForm) => {
    try {
      // rewardType, expAmount는 서버에서 자동 설정하므로 제외
      // 날짜는 이미 ISO 8601 형식 (DateTimePicker에서 toISOString() 사용)
      const payload = {
        questName: data.questName,
        questType: data.questType,
        description: data.description,
        rewardId: data.rewardId,
        startDate: data.startDate,
        endDate: data.endDate,
        requiredLevel: data.requiredLevel,
        maxParticipants: data.maxParticipants,
      };

      await createQuestMutation.mutateAsync(payload as QuestForm);
      showToast('퀘스트가 생성되었습니다.', 'success');
      router.back();
    } catch (error) {
      const message = getApiErrorMessage(error, '퀘스트 생성에 실패했습니다.');
      showToast(message, 'error');
    }
  };

  // 초기 폼 값
  const initialForm: Partial<QuestForm> = {
    questName: '',
    questType: undefined,
    description: '',
    rewardId: undefined,
    startDate: '',
    endDate: '',
    requiredLevel: undefined,
    maxParticipants: undefined,
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      enableResetScrollToCoords={false}
    >
      <Form
        form={initialForm as QuestForm}
        style={styles.container}
        validators={{
          questName: (value) => {
            if (!value) return '퀘스트 이름을 입력해주세요.';
            if (value.length > 100) return '100자 이하로 입력해주세요.';
            return undefined;
          },
          questType: (value) => {
            if (!value) return '퀘스트 타입을 선택해주세요.';
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
          endDate: (value, form) => {
            if (!value) return '종료 날짜를 선택해주세요.';
            if (new Date(value) <= new Date(form.startDate)) {
              return '종료 날짜는 시작 날짜보다 이후여야 합니다.';
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

        {/* 퀘스트 타입 */}
        <FormItem
          name="questType"
          label="퀘스트 타입"
          item={({ value, onChange }) => (
            <Select
              value={value as 'DAILY' | 'WEEKLY' | undefined}
              items={QUEST_TYPE_OPTIONS}
              onSelect={onChange}
              placeholder="퀘스트 타입 선택"
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
          item={({ value, onChange }) => (
            <Select<number>
              value={value as number | undefined}
              items={rewardOptions}
              onSelect={(val) => onChange(val as any)}
              placeholder="보상 선택"
            />
          )}
        />

        {/* 시작 날짜 및 시간 */}
        <FormItem
          name="startDate"
          label="시작 날짜 및 시간"
          item={({ value, form, setValue }) => (
            <ThemeView transparent>
              <ThemeView style={styles.dateTimeWrapper} transparent>
                <ThemeView style={styles.dateTimeDisplay} transparent>
                  {form.startDate && (
                    <Typography style={styles.dateTimeText} numberOfLines={1}>
                      {value ? formatDateTime(new Date(value)) : form.startDate}
                    </Typography>
                  )}
                  {!form.startDate && (
                    <Typography style={styles.placeholderText}>
                      날짜/시간 미선택
                    </Typography>
                  )}
                </ThemeView>
                <Button
                  title="선택"
                  variant="secondary"
                  size="sm"
                  onPress={() => setIsShowStartDate(!isShowStartDate)}
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
              {isShowStartDate && (
                <DateTimePicker
                  themeVariant={colorScheme}
                  value={value ? new Date(value) : new Date()}
                  mode="datetime"
                  minimumDate={new Date()}
                  onChange={(event, startDate = new Date()) => {
                    // Android: 확인 버튼 클릭 시에만 닫기
                    // iOS: 날짜 변경할 때마다 호출
                    if (event.type === 'dismissed') {
                      setIsShowStartDate(false);
                      return;
                    }

                    setValue('startDate', toISOStringWithoutMs(startDate));

                    const endDate = new Date(form.endDate || startDate);

                    if (form.endDate && endDate < startDate) {
                      setValue('endDate', toISOStringWithoutMs(startDate));
                    }

                    // Android에서 확인 버튼 클릭 시에만 닫기
                    if (event.type === 'set') {
                      setIsShowStartDate(false);
                    }
                  }}
                />
              )}
            </ThemeView>
          )}
        />

        {/* 종료 날짜 및 시간 */}
        <FormItem
          name="endDate"
          label="종료 날짜 및 시간"
          item={({ value, form, setValue }) => (
            <ThemeView transparent>
              <ThemeView style={styles.dateTimeWrapper} transparent>
                <ThemeView style={styles.dateTimeDisplay} transparent>
                  {form.endDate && (
                    <Typography style={styles.dateTimeText} numberOfLines={1}>
                      {value ? formatDateTime(new Date(value)) : form.endDate}
                    </Typography>
                  )}
                  {!form.endDate && (
                    <Typography style={styles.placeholderText}>
                      날짜/시간 미선택
                    </Typography>
                  )}
                </ThemeView>
                <Button
                  title="선택"
                  variant="secondary"
                  size="sm"
                  onPress={() => setIsShowEndDate(!isShowEndDate)}
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
              {isShowEndDate && (
                <DateTimePicker
                  themeVariant={colorScheme}
                  value={
                    value
                      ? new Date(value)
                      : new Date(form.startDate || Date.now())
                  }
                  mode="datetime"
                  minimumDate={
                    form.startDate ? new Date(form.startDate) : new Date()
                  }
                  onChange={(event, endDate = new Date()) => {
                    // Android: 확인 버튼 클릭 시에만 닫기
                    // iOS: 날짜 변경할 때마다 호출
                    if (event.type === 'dismissed') {
                      setIsShowEndDate(false);
                      return;
                    }

                    setValue('endDate', toISOStringWithoutMs(endDate));

                    // Android에서 확인 버튼 클릭 시에만 닫기
                    if (event.type === 'set') {
                      setIsShowEndDate(false);
                    }
                  }}
                />
              )}
            </ThemeView>
          )}
        />

        {/* 필요 레벨 */}
        <FormItem
          name="requiredLevel"
          label="필요 레벨"
          item={({ value, onChange }) => {
            const handleChange = (text: string) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              onChange(numericValue);
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
              const numericValue = text.replace(/[^0-9]/g, '');
              onChange(numericValue);
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

        {/* 제출 버튼 */}
        <QuestFormButtonGroup
          useForm={useForm}
          loading={createQuestMutation.isPending}
        />
      </Form>
    </KeyboardAwareScrollView>
  );
};

export default QuestFormModal;

const styles = StyleSheet.create((theme) => ({
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
