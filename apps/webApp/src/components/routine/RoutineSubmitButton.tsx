import Button from '../common/button/Button';
import { FormContextType } from '@repo/shared/components';

interface RoutineSubmitButtonProps<T> {
  useForm: () => FormContextType<T>
}

const RoutineSubmitButton = <T extends object>({ useForm }: RoutineSubmitButtonProps<T>) => {
  const { enabled } = useForm();

  return (
    <Button
      type="submit"
      className="disabled:opacity-30 disabled:cursor-not-allowed"
      disabled={!enabled}
    >
      추가
    </Button>
  );
};

export default RoutineSubmitButton;
