import { useContext, useEffect } from 'react';

import Label from '../input/Label';

import {
  FormContext,
  FormContextProps,
  FormRule,
  FormValue,
} from './FormProvider';

interface FormItemRender {
  (props: {
    name: string;
    value: FormValue;
    onChange: React.ChangeEventHandler;
    form: object;
    setValue: (name: string, value: FormValue) => void;
  }): React.ReactNode;
}

interface FormItemProps {
  className?: string;
  flex?: boolean;
  rule?: FormRule;
  name: string;
  label?: string;
  render: FormItemRender;
}

const FormItem = ({
  className,
  flex,
  rule,
  name,
  label,
  render,
}: FormItemProps) => {
  const { form, setRule, setValue } = useContext(FormContext);

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    setValue(name as keyof FormContextProps<object>, e.target.value);
  };

  const handleSetValue = (key: string, value: FormValue) => {
    setValue(key as keyof FormContextProps<object>, value);
  };

  useEffect(() => {
    if (!rule) return;

    setRule(name as keyof FormContextProps<object>, rule);
  }, []);

  return (
    <div className={`flex ${className} ${flex ? 'flex-1' : ''}`}>
      {label && (
        <Label htmlFor={name} className="text-sm font-bold">
          {label}
        </Label>
      )}

      {render({
        name,
        value: form[name],
        onChange: handleChange,
        form,
        setValue: handleSetValue,
      })}
    </div>
  );
};

export { FormItem };
