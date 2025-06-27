import { Routine, RoutineForm as RoutineFormType } from '@/api/routine.api';
import { useModalStore } from '@/store/modal.store';

import Button from '../common/button/Button';
import Form from '../common/form/Form';
import { FormItem } from '../common/form/FormItem';
import Input from '../common/input/Input';

import RoutineSubmitButton from './RoutineSubmitButton';

interface RoutineFormProps {
  nickname: string;
  mateNickname: string;
  form?: Routine;
  onSubmit: (data: RoutineFormType) => void;
}

const routineFormInit = {
  nickname: '',
  routineName: '',
  routineDetail: '',
  penalty: 0,
  routineCount: 1,
  startDate: '',
  endDate: '',
  mateNickname: '',
};

const RoutineForm = ({
  nickname,
  mateNickname,
  form: formData,
  onSubmit,
}: RoutineFormProps) => {
  const closeModal = useModalStore((state) => state.close);
  const form: RoutineFormType = {
    ...routineFormInit,
    nickname,
    mateNickname,
    ...formData,
  };

  return (
    <Form data={form} onSubmit={onSubmit}>
      <FormItem
        name="routineName"
        className="flex flex-col gap-2 mt-5"
        label="루틴 이름"
        rule={{ required: true }}
        render={({ value, name, onChange }) => (
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
        rule={{ required: true }}
        render={({ value, name, onChange }) => (
          <Input
            name={name}
            value={value}
            placeholder="루틴을 설명해주세요."
            onChange={onChange}
          />
        )}
      />
      <FormItem
        name="penalty"
        className="flex flex-col gap-2 mt-5"
        label="벌금"
        rule={{ required: true, min: 0 }}
        render={({ value, name, onChange }) => (
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
        rule={{ required: true, min: 1, max: 7 }}
        render={({ value, name, onChange }) => (
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
        rule={{ required: true }}
        render={({ value, name, onChange, form, setValue }) => (
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
                const endDate = new Date(routineForm.endDate);

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
        render={({ value, name, onChange, form, setValue }) => (
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
        <RoutineSubmitButton />
      </div>
    </Form>
  );
};

export default RoutineForm;
