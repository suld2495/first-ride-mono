import { useEffect, useRef, useState } from 'react';

import {
  CustomValidator,
  NumberValidator,
  PatternValidator,
  RequiredValidator,
  StringValidator,
  Validator,
} from '@/utils/validator';

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

interface FormState<Form extends object> {
  initialState: Form;
  validator: Partial<Record<keyof Form, FormRule>>;
}

const validate = <Form extends object>(
  form: Form,
  validator: Partial<Record<keyof Form, Validator[]>>,
) => {
  return Object.entries(form)
    .filter(([name]) => validator[name as keyof Form])
    .map(([name, value = '']) => {
      const validators = validator[name as keyof Form] || [];

      const isInvalid = validators.some(
        (validatorImpl) => !validatorImpl.validate(value.toString()),
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
      {} as Partial<Record<keyof Form, boolean>>,
    );
};

export const useForm = <Form extends object>({
  initialState,
  validator,
}: FormState<Form>) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, boolean>>>(
    {},
  );
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>(
    {},
  );
  const validatorRef = useRef<Partial<Record<keyof Form, Validator[]>>>({});

  const handleChange = (key: keyof Form, value: unknown) => {
    let newForm: Form;

    setForm((prev) => {
      newForm = { ...prev, [key]: value };
      setErrors(
        validate(newForm, validatorRef.current) as Partial<
          Record<keyof Form, boolean>
        >,
      );
      return newForm;
    });

    setTouched((prev) => {
      return {
        ...Object.keys(prev).reduce(
          (acc, objKey) => ({ ...acc, [objKey]: false }),
          {} as Partial<Record<keyof Form, boolean>>,
        ),
        [key]: true,
      };
    });
  };

  useEffect(() => {
    Object.keys(validator).forEach((key) => {
      const rule = validator[key as keyof Form] as FormRule;
      const validators: Validator[] = [];

      if (isNumberRule(rule)) {
        const validatorImpl = new NumberValidator({
          min: rule.min,
          max: rule.max,
        });

        validators.push(validatorImpl);
      }

      if (isStringRule(rule)) {
        const validatorImpl = new StringValidator({
          minLength: rule.minLength,
          maxLength: rule.maxLength,
        });

        validators.push(validatorImpl);
      }

      if (rule.pattern) {
        const validatorImpl = new PatternValidator(rule.pattern);

        validators.push(validatorImpl);
      }

      if (rule.required) {
        const validatorImpl = new RequiredValidator();

        validators.push(validatorImpl);
      }

      if (rule.validate) {
        const validatorImpl = new CustomValidator(rule.validate);

        validators.push(validatorImpl);
      }

      validatorRef.current[key as keyof Form] = validators;
    });
  }, []);

  return {
    form,
    handleChange,
    errors,
    touched,
    validate: (data: Form) => {
      const isValid = Object.values(validate(data, validatorRef.current));

      return isValid.length > 0 && isValid.every((error) => !error);
    },
  };
};
