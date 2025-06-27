import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CustomValidator,
  NumberValidator,
  PatternValidator,
  RequiredValidator,
  StringValidator,
  Validator,
} from '@/utils/validator';

export type FormValue = number | string;
export type FormData<T extends object> = {
  [key in keyof T]: FormValue;
};

interface Rule {
  required?: boolean;
  pattern?: RegExp;
  validate?: (value: unknown) => boolean;
}

interface NumberRule extends Rule {
  min?: number;
  max?: number;
}

interface StringRule extends Rule {
  minLength?: number;
  maxLength?: number;
}

const isNumberRule = (rule: FormRule): rule is NumberRule => {
  return 'min' in rule || 'max' in rule;
};

const isStringRule = (rule: FormRule): rule is StringRule => {
  return 'minLength' in rule || 'maxLength' in rule;
};

export type FormRule = Rule | NumberRule | StringRule;

export interface FormContextProps<T extends FormData<T>> {
  form: T;
  rules: Partial<{ [key in keyof FormData<T>]: Validator[] }>;
  errors: Partial<{ [key in keyof FormData<T>]: boolean }>;
  enabled: boolean;
  setValue: (name: keyof FormContextProps<T>, value: FormValue) => void;
  setRule: (name: keyof FormContextProps<T>, rule: FormRule) => void;
  validate: () => boolean;
}

export const FormContext = createContext<
  FormContextProps<FormData<Record<string, FormValue>>>
>({
  form: {},
  rules: {},
  errors: {},
  enabled: false,
  setRule: () => {},
  setValue: () => {},
  validate: () => true,
});

interface FormProviderProps<T extends object> {
  children: ReactNode;
  data: T;
}

const FormProvider = <T extends FormData<T>>({
  children,
  data,
}: FormProviderProps<T>) => {
  const [form, setForm] = useState<T>(data);
  const [rules, setRules] = useState<FormContextProps<T>['rules']>({});
  const [errors, setErrors] = useState<FormContextProps<T>['errors']>({});
  const [enabled, setEnabled] = useState(false);

  const setRule: FormContextProps<T>['setRule'] = useCallback((name, rule) => {
    const validators: Validator[] = [];

    if (isNumberRule(rule)) {
      const validator = new NumberValidator({
        min: rule.min,
        max: rule.max,
      });

      validators.push(validator);
    }

    if (isStringRule(rule)) {
      const validator = new StringValidator({
        minLength: rule.minLength,
        maxLength: rule.maxLength,
      });

      validators.push(validator);
    }

    if (rule.pattern) {
      const validator = new PatternValidator(rule.pattern);

      validators.push(validator);
    }

    if (rule.required) {
      const validator = new RequiredValidator();

      validators.push(validator);
    }

    if (rule.validate) {
      const validator = new CustomValidator(rule.validate);

      validators.push(validator);
    }

    setRules((prev) => ({
      ...prev,
      [name]: validators,
    }));
  }, []);

  const setValue: FormContextProps<T>['setValue'] = useCallback(
    (name, value) => {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const validate = useCallback(() => {
    const result = Object.entries(form)
      .filter(([name]) => rules[name as keyof typeof form])
      .map(([name, value = '']) => {
        const validators = rules[name as keyof typeof form] || [];

        const isInvalid = validators.some(
          (validator) => !validator.validate((value as FormValue).toString()),
        );

        return {
          [name]: isInvalid,
        };
      })
      .reduce(
        (acc, value) => {
          return {
            ...acc,
            ...value,
          };
        },
        {} as Partial<Record<keyof T, boolean>>,
      );

    setErrors(result);
    return Object.values(result).every((error) => !error);
  }, [form, rules]);

  const value = useMemo(
    () => ({
      form,
      rules,
      errors,
      enabled,
      setRule,
      setValue,
      validate,
    }),
    [form, rules, errors, enabled, setRule, setValue, validate],
  );

  useEffect(() => {
    setEnabled(validate());
  }, [form, validate]);

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export default FormProvider;
