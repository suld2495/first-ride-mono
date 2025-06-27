import { useContext } from 'react';

import { FormContext, FormData } from './FormProvider';

interface FormContainerProps<T extends FormData<T>>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: (data: T) => void;
}

const FormContainer = <T extends FormData<T>>({
  children,
  onSubmit,
  ...props
}: FormContainerProps<T>) => {
  const { form, validate } = useContext(FormContext);

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(form as T);
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  );
};

export default FormContainer;
