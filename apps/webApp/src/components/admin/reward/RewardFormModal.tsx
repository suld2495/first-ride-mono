import { useMemo } from 'react';
import {
  useCreateRewardMutation,
  useUpdateRewardMutation,
} from '@repo/shared/hooks/useQuest';
import { Reward, RewardForm as RewardFormType } from '@repo/types';

import { createForm } from '@/hooks/useForm';
import { useToast } from '@/hooks/useToast';

import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import Paragraph from '@/components/common/paragraph/Paragraph';
import Select from '@/components/common/Select';
import ToastContainer from '@/components/common/ToastContainer';

interface RewardFormModalProps {
  isOpen: boolean;
  reward?: Reward;
  onClose: () => void;
}

const rewardFormInit: RewardFormType = {
  rewardName: '',
  rewardType: 'BADGE',
  description: '',
  expAmount: 0,
};

const { Form, FormItem } = createForm<RewardFormType>();

const RewardFormModal = ({
  isOpen,
  reward,
  onClose,
}: RewardFormModalProps) => {
  const createMutation = useCreateRewardMutation();
  const updateMutation = useUpdateRewardMutation();
  const { toasts, success, error, removeToast } = useToast();

  const form: RewardFormType = useMemo(() => {
    if (!reward) {
      return rewardFormInit;
    }

    return {
      rewardName: reward.rewardName,
      rewardType: reward.rewardType,
      description: reward.description,
      expAmount: reward.expAmount,
    };
  }, [reward]);

  const handleSubmit = async (data: RewardFormType) => {
    try {
      if (reward) {
        await updateMutation.mutateAsync({
          rewardId: reward.rewardId,
          ...data,
        });
        success('보상이 수정되었습니다');
      } else {
        await createMutation.mutateAsync(data);
        success('보상이 생성되었습니다');
      }

      onClose();
    } catch (err) {
      error('오류가 발생했습니다. 다시 시도해주세요.');
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
            variant="h3"
          >
            {reward ? '보상 수정' : '보상 생성'}
          </Paragraph>

          <Form
            form={form}
            onSubmit={handleSubmit}
            validators={{
              rewardName: (value) =>
                value ? undefined : '보상명을 입력해주세요',
              rewardType: (value) => (value ? undefined : '타입을 선택해주세요'),
              expAmount: (value) =>
                value >= 0 ? undefined : '0 이상의 숫자를 입력해주세요',
            }}
          >
            <FormItem
              name="rewardName"
              className="flex flex-col gap-2 mt-5"
              label="보상명*"
            >
              {({ value, name, onChange }) => (
                <Input
                  name={name}
                  value={value}
                  onChange={onChange}
                  placeholder="보상명을 입력하세요"
                  maxLength={50}
                />
              )}
            </FormItem>

            <FormItem
              name="rewardType"
              className="flex flex-col gap-2 mt-5"
              label="타입*"
            >
              {({ value, name, onChange }) => (
                <Select
                  name={name}
                  value={value}
                  onChange={onChange}
                  options={[
                    { label: 'BADGE', value: 'BADGE' },
                    { label: 'EXP', value: 'EXP' },
                  ]}
                />
              )}
            </FormItem>

            <FormItem
              name="expAmount"
              className="flex flex-col gap-2 mt-5"
              label="경험치*"
            >
              {({ value, name, onChange }) => (
                <Input
                  type="number"
                  name={name}
                  value={value}
                  onChange={onChange}
                  min={0}
                  max={1000000}
                  placeholder="경험치를 입력하세요"
                />
              )}
            </FormItem>

            <FormItem
              name="description"
              className="flex flex-col gap-2 mt-5"
              label="설명"
            >
              {({ value, name, onChange }) => (
                <textarea
                  className="border-[1px] border-gray-300 dark:border-gray-400 rounded-md p-2 text-[14px] outline-0 focus:border-gray-500 dark:focus:border-gray-200 focus:ring-0 transition-colors duration-300 text-gray-main dark:text-gray-200 bg-white dark:bg-dark-primary-color"
                  name={name}
                  value={value || ''}
                  onChange={onChange}
                  maxLength={200}
                  rows={3}
                  placeholder="설명을 입력하세요 (선택사항)"
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default RewardFormModal;
