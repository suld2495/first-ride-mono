import { useMemo, useState } from 'react';
import {
  useCreateQuestMutation,
  useUpdateQuestMutation,
} from '@repo/shared/hooks/useQuest';
import { Quest, QuestForm as QuestFormType } from '@repo/types';

import RewardSelectModal from '@/components/admin/quest/RewardSelectModal';
import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import Paragraph from '@/components/common/paragraph/Paragraph';
import Select from '@/components/common/Select';
import ToastContainer from '@/components/common/ToastContainer';
import { createForm } from '@/hooks/useForm';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/utils/error-utils';
import { fromDateTimeLocal, toDateTimeLocal } from '@/utils/quest-utils';

interface QuestFormModalProps {
  isOpen: boolean;
  quest?: Quest;
  onClose: () => void;
}

const questFormInit: QuestFormType = {
  questName: '',
  questType: 'DAILY',
  description: '',
  rewardId: 0,
  startDate: '',
  endDate: '',
  requiredLevel: 1,
  maxParticipants: 0,
  rewardType: 'BADGE',
  expAmount: 0,
};

const { Form, FormItem } = createForm<QuestFormType>();

const QuestFormModal = ({ isOpen, quest, onClose }: QuestFormModalProps) => {
  const createMutation = useCreateQuestMutation();
  const updateMutation = useUpdateQuestMutation();
  const { toasts, success, error, removeToast } = useToast();

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{
    id: number;
    name: string;
  } | null>(
    quest ? { id: quest.rewardId, name: quest.rewardName || '' } : null,
  );

  const form: QuestFormType = useMemo(() => {
    if (!quest) {
      return {
        ...questFormInit,
        rewardId: selectedReward?.id || 0,
      };
    }

    return {
      questName: quest.questName,
      questType: quest.questType,
      description: quest.description,
      rewardId: selectedReward?.id || quest.rewardId,
      startDate: toDateTimeLocal(quest.startDate),
      endDate: toDateTimeLocal(quest.endDate),
      requiredLevel: quest.requiredLevel,
      maxParticipants: quest.maxParticipants,
      expAmount: quest.expAmount,
      rewardType: quest.rewardType,
    };
  }, [quest, selectedReward]);

  const handleSubmit = async (data: QuestFormType) => {
    try {
      const submitData = {
        ...data,
        startDate: fromDateTimeLocal(data.startDate),
        endDate: fromDateTimeLocal(data.endDate),
      };

      if (quest) {
        await updateMutation.mutateAsync({ id: quest.questId, ...submitData });
        success('퀘스트가 수정되었습니다');
      } else {
        await createMutation.mutateAsync(submitData);
        success('퀘스트가 생성되었습니다');
      }

      onClose();
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '오류가 발생했습니다. 다시 시도해주세요.',
      );
      error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed w-full h-dvh top-0 left-0 flex items-center justify-center px-5 z-10">
        <div
          className="absolute w-full h-full bg-gray-950 opacity-50"
          onClick={onClose}
        />
        <div className="relative z-1 p-6 bg-white dark:bg-dark-primary-color rounded-xl max-w-[var(--max-width)] w-full max-h-[90vh] overflow-y-auto">
          <Paragraph
            className="pb-5 border-b-[1px] border-b-gray-300"
            variant="subtitle"
          >
            {quest ? '퀘스트 수정' : '퀘스트 생성'}
          </Paragraph>

          <Form
            form={form}
            onSubmit={handleSubmit}
            validators={{
              questName: (value) =>
                value ? undefined : '퀘스트명을 입력해주세요',
              description: (value) =>
                value ? undefined : '설명을 입력해주세요',
              rewardId: (value) => (value ? undefined : '보상을 선택해주세요'),
              startDate: (value) =>
                value ? undefined : '시작일을 입력해주세요',
              endDate: (value, values) => {
                if (!value) return '종료일을 입력해주세요';
                if (new Date(value) < new Date(values.startDate)) {
                  return '종료일은 시작일 이후여야 합니다';
                }
                return undefined;
              },
              requiredLevel: (value) =>
                value < 1 ? '1 이상의 숫자를 입력해주세요' : undefined,
            }}
          >
            <FormItem
              name="questName"
              className="flex flex-col gap-2 mt-5"
              label="퀘스트명*"
            >
              {({ value, name, onChange }) => (
                <Input
                  name={name}
                  value={value}
                  onChange={onChange}
                  placeholder="퀘스트명을 입력하세요"
                />
              )}
            </FormItem>

            <FormItem
              name="questType"
              className="flex flex-col gap-2 mt-5"
              label="타입*"
            >
              {({ value, name, onChange }) => (
                <Select
                  name={name}
                  value={value}
                  onChange={onChange}
                  options={[
                    { label: 'DAILY', value: 'DAILY' },
                    { label: 'WEEKLY', value: 'WEEKLY' },
                  ]}
                />
              )}
            </FormItem>

            <FormItem
              name="description"
              className="flex flex-col gap-2 mt-5"
              label="설명*"
            >
              {({ value, name, onChange }) => (
                <textarea
                  className="border-[1px] border-gray-300 dark:border-gray-400 rounded-md p-2 text-[14px] outline-0 focus:border-gray-500 dark:focus:border-gray-200 focus:ring-0 transition-colors duration-300 text-gray-main dark:text-gray-200 bg-white dark:bg-dark-primary-color"
                  name={name}
                  value={value}
                  onChange={onChange}
                  maxLength={200}
                  rows={3}
                />
              )}
            </FormItem>

            <FormItem
              name="rewardId"
              className="flex flex-col gap-2 mt-5"
              label="보상*"
            >
              {() => (
                <div>
                  <div className="flex gap-2">
                    <Input
                      value={selectedReward?.name || ''}
                      readOnly
                      placeholder="보상을 선택하세요"
                    />
                    <Button
                      onClick={() => setIsRewardModalOpen(true)}
                      type="button"
                    >
                      🔍
                    </Button>
                  </div>
                  {selectedReward && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      선택된 보상: {selectedReward.name}
                    </p>
                  )}
                </div>
              )}
            </FormItem>

            <FormItem
              name="startDate"
              className="flex flex-col gap-2 mt-5"
              label="시작일*"
            >
              {({ value, name, onChange }) => (
                <Input
                  type="datetime-local"
                  name={name}
                  value={value}
                  onChange={onChange}
                />
              )}
            </FormItem>

            <FormItem
              name="endDate"
              className="flex flex-col gap-2 mt-5"
              label="종료일*"
            >
              {({ value, name, onChange }) => (
                <Input
                  type="datetime-local"
                  name={name}
                  value={value}
                  onChange={onChange}
                />
              )}
            </FormItem>

            <FormItem
              name="requiredLevel"
              className="flex flex-col gap-2 mt-5"
              label="필요 레벨*"
            >
              {({ value, name, onChange }) => (
                <Input
                  type="number"
                  name={name}
                  value={value}
                  onChange={onChange}
                  min={1}
                />
              )}
            </FormItem>

            <FormItem
              name="maxParticipants"
              className="flex flex-col gap-2 mt-5"
              label="최대 참여자"
            >
              {({ value, name, onChange }) => (
                <Input
                  type="number"
                  name={name}
                  value={value || ''}
                  onChange={onChange}
                  placeholder="선택사항"
                />
              )}
            </FormItem>

            <div className="flex justify-end gap-2 mt-5">
              <Button type="button" variant="plain" onClick={onClose}>
                취소
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? '저장 중...'
                  : '저장하기'}
              </Button>
            </div>
          </Form>
        </div>
      </div>

      <RewardSelectModal
        isOpen={isRewardModalOpen}
        selectedRewardId={selectedReward?.id}
        onClose={() => setIsRewardModalOpen(false)}
        onSelect={(reward) => {
          setSelectedReward({ id: reward.rewardId, name: reward.rewardName });
          setIsRewardModalOpen(false);
        }}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default QuestFormModal;
