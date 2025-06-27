import { useContext } from 'react';

import Button from '../common/button/Button';
import { FormContext } from '../common/form/FormProvider';

const RoutineSubmitButton = () => {
  const { enabled } = useContext(FormContext);

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
