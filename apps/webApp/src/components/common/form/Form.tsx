import FormContainer from './FormContainer';
import { FormGroup } from './FormGroup';
import { FormItem } from './FormItem';
import FormProvider, { FormData } from './FormProvider';

interface FormProps<T extends FormData<T>>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  data?: T;
  onSubmit: (data: T) => void | Promise<void>;
}

const Form = <T extends FormData<T>>({
  children,
  onSubmit,
  data,
  ...props
}: FormProps<T>) => {
  return (
    <FormProvider data={data || {}}>
      <FormContainer onSubmit={onSubmit} {...props}>
        {children}
      </FormContainer>
    </FormProvider>
  );
};

Form.FormItem = FormItem;
Form.FormGroup = FormGroup;

export default Form;
