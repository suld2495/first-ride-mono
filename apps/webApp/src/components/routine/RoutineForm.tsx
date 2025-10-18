import { Routine, RoutineForm as RoutineFormType } from '@repo/types';
import { useMemo } from 'react';

import { useModalStore } from '@/store/modal.store';

import Button from '../common/button/Button';
import Input from '../common/input/Input';

import RoutineSubmitButton from './RoutineSubmitButton';
import AutoComplete from '../common/autocomplete/AutoComplete';
import { useFetchFriendsQuery } from '@repo/shared/hooks/useFriend';
import { createForm } from '@/hooks/useForm';
import { routineFormValidators } from '@repo/shared/service/validatorMessage';
import Label from '../common/input/Label';

interface RoutineFormProps {
  nickname: string;
  mateNickname?: string;
  form?: Routine;
  onSubmit: (data: RoutineFormType) => void;
}

const routineFormInit: RoutineFormType = {
  nickname: '',
  routineName: '',
  routineDetail: '',
  penalty: 0,
  routineCount: 1,
  startDate: '',
  endDate: '',
  mateNickname: '',
  isMe: false,
};

const { Form, FormItem, useForm } = createForm<RoutineFormType>();

const RoutineForm = ({
  nickname,
  form: formData,
  onSubmit,
}: RoutineFormProps) => {
  const closeModal = useModalStore((state) => state.close);
  const { data: friendList = [] } = useFetchFriendsQuery();

  const form: RoutineFormType = useMemo(() => ({
    ...routineFormInit,
    nickname,
    ...formData,
  }), [nickname, formData]);

  return (
    <Form form={form} onSubmit={onSubmit} validators={{
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
    }}>
      <FormItem
        name="routineName"
        className="flex flex-col gap-2 mt-5"
        label="루틴 이름"
        children={({ value, name, onChange }) => (
          <Input
            name={name}
            value={value}
            placeholder="루틴 이름을 입력하세요."
            onChange={onChange}
          />
        )}
      />
      <FormItem
        name="routineDetail"
        className="flex flex-col gap-2 mt-5"
        label="루틴 설명"
        children={({ value, name, onChange }) => (
          <Input
            name={name}
            value={value}
            placeholder="루틴을 설명해주세요."
            onChange={onChange}
          />
        )}
      />
      <FormItem
        name='mateNickname'
        className="flex flex-col gap-2 mt-5"
        label="메이트"
        children={({ value, name, onChange, form, setValue }) => (
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <Label>직접 루틴 체크</Label>
              <Input
                className='min-w-4 cursor-pointer'
                type='checkbox'
                checked={form.isMe}
                onChange={(e) => setValue('isMe', e.target.checked)}
              />
            </div>
            <AutoComplete
              className='flex-1'
              name={name}
              value={value}
              placeholder="메이트를 지정해주세요."
              onChange={onChange}
              values={friendList?.map(({ nickname }) => nickname)}
              disabled={form.isMe}
            />
          </div>
        )}
      />
      <FormItem
        name="penalty"
        className="flex flex-col gap-2 mt-5"
        label="벌금"
        children={({ value, name, onChange }) => (
          <Input
            type="number"
            name={name}
            value={value}
            min={0}
            placeholder="벌금을 입력하세요."
            onChange={onChange}
          />
        )}
      />
      <FormItem
        name="routineCount"
        className="flex flex-col gap-2 mt-5"
        label="루틴 횟수"
        children={({ value, name, onChange }) => (
          <Input
            type="number"
            name={name}
            value={value}
            max={7}
            min={1}
            placeholder="루틴 횟수를 입력하세요."
            onChange={onChange}
          />
        )}
      />
      <FormItem
        name="startDate"
        className="flex flex-col gap-2 mt-5"
        label="루틴 시작 날짜"
        children={({ value, name, onChange, form, setValue }) => (
          <Input
            type="date"
            name={name}
            value={value}
            placeholder="루틴 시작 날짜를 입력하세요."
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              const routineForm = form as RoutineFormType;

              if (target.name === 'startDate') {
                const startDate = new Date(target.value);
                const endDate = new Date(routineForm.endDate || '');

                if (routineForm.endDate && endDate < startDate) {
                  setValue('endDate', target.value);
                }
              }

              onChange(e);
            }}
          />
        )}
      />
      <FormItem
        name="endDate"
        className="flex flex-col gap-2 mt-5"
        label="루틴 종료 날짜"
        children={({ value, name, onChange, form, setValue }) => (
          <Input
            type="date"
            name={name}
            value={value}
            placeholder="루틴 종료 날짜를 입력하세요."
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              const routineForm = form as RoutineFormType;
              const startDate = new Date(routineForm.startDate);
              const endDate = new Date(target.value);

              if (routineForm.startDate && endDate < startDate) {
                setValue('startDate', target.value);
              }

              onChange(e);
            }}
          />
        )}
      />
      <div className="flex justify-end mt-5">
        <Button
          type="button"
          variant="plain"
          className="mr-2"
          onClick={closeModal}
        >
          취소
        </Button>
        <RoutineSubmitButton  useForm={useForm} />
      </div>
    </Form>
  );
};

export default RoutineForm;
