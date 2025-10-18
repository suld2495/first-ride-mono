import React, { useCallback, useContext, useMemo, useReducer } from "react";
import { ValidationErrors, Validator, Validators } from ".";
import { formReducer } from "./FormReducer";
import { toArray } from "../../utils";

export type FormProviderProps<T> = {
  form: T;
  validators?: Validators<T>;
  validateOnChange?: boolean
  validateOnBlur?: boolean;
  onSubmit?: (data: T, result: { errors: ValidationErrors<T>; isValid: boolean }) => void;
  children: React.ReactNode;
};

export type FormState<T> = {
  form: T;
  touched: Partial<Record<keyof T, boolean>>;
  errors: ValidationErrors<T>;
  enabled: boolean;
};

export type FormContextType<T> = {
  form: FormState<T>['form'];
  touched: FormState<T>['touched'];
  errors: FormState<T>['errors'];
  enabled: FormState<T>['enabled'];

  isValid: (key?: keyof T) => boolean;
  getFieldErrors: (key: keyof T) => string[];

  setValue: <K extends keyof T>(key: K, value: T[K], options?: { validate?: boolean; touch?: boolean }) => void;
  touch: (key: keyof T, doValidate?: boolean) => void;
  validateField: (key: keyof T, form?: T) => FormContextType<T>['errors'][keyof T];
  validateAll: () => { errors: FormContextType<T>['errors']; isValid: boolean };
  reset: (next?: T) => void;
  handleSubmit: () => void;
};

export function useCreateForm<T extends Record<string, any>>() {
  const FormContext = React.createContext<FormContextType<T> | null>(null);

  const Provider = ({
    form,
    validators,
    children,
    onSubmit
  }: FormProviderProps<T>) => {
    const [state, dispatch] = useReducer(formReducer<T>, {
      form,
      errors: {},
      touched: {},
      enabled: false,
    });

    const isValid: FormContextType<T>['isValid'] = useCallback((key) => {
      if (typeof key !== 'undefined') {
        return (state.errors[key]?.length ?? 0) === 0;
      }

      return Object.keys(state.errors).length === 0;
    }, [state.errors]);

    const validateField: FormContextType<T>['validateField'] = useCallback((key, form = state.form) => {
      const errors = doValidateField(validators, form, key);
      const allErrors = doAllValidators(validators, form);

      dispatch({ 
        type: 'SET_FIELD_ERRORS', 
        key, 
        errors, 
        isValid: Object.keys(allErrors).length === 0 
      });
      return errors;
    }, [validators, state.form]);

    const getFieldErrors: FormContextType<T>['getFieldErrors'] = useCallback((key) => (
      state.errors[key] ?? []
    ), [state.errors]);

    const setValue: FormContextType<T>['setValue'] = useCallback((key, value, options) => {
      dispatch({ type: 'SET_VALUE', key, value });

      const touched = options?.touch ?? false;
      const validated = options?.validate ?? true;

      if (touched) {
        touch(key);
      }

      if (validated) {
        validateField(key, {
          ...state.form,
          [key]: value,
        });
      }
    }, [dispatch, validateField]);

    const touch: FormContextType<T>['touch'] = useCallback((key, doValidate = true) => {
      dispatch({ type: 'TOUCH', key });

      if (doValidate) {
        validateField(key);
      }
    }, [dispatch, validateField]);

    const validateAll: FormContextType<T>['validateAll'] = useCallback(() => {
      const errors = doAllValidators(validators, state.form);

      dispatch({ type: 'SET_ERRORS', errors });

      const isValid = Object.keys(errors).length === 0;
      
      return { errors, isValid };
    }, [state.form, validators]);

    const reset = useCallback((newForm?: T) => {
      dispatch({ type: "RESET", form: newForm ?? form });
    }, [form]);

    const handleSubmit = useCallback(() => {
      onSubmit?.(state.form, validateAll());
    }, [validateAll, onSubmit, state.form]);

    const value: FormContextType<T> = useMemo(() => ({
      form: state.form,
      errors: state.errors,
      touched: state.touched,
      enabled: state.enabled,
      isValid,
      getFieldErrors,
      setValue,
      touch,
      validateField,
      validateAll,
      reset,
      handleSubmit
    }), [state.form, state.errors, state.touched, isValid, getFieldErrors, setValue, touch, validateField, validateAll, reset, handleSubmit]);

    return (
      <FormContext.Provider value={value}>
        {children}
      </FormContext.Provider>
    );
  }

  const useForm: () => FormContextType<T> = () => {
    const context = useContext(FormContext);
    
    if (!context) {
      throw new Error("useForm must be used within Provider returned by useCreateForm()");
    }

    return context;
  };

  const useFormField = <K extends keyof T>(name: K) => {
    const form = useForm();
    const value = form.form[name];
    const errors = form.getFieldErrors(name);
    const touched = !!form.touched[name];
    const isValid = errors.length === 0;

    const set = useCallback(
      (value: T[K], options?: { validate?: boolean; touch?: boolean }) => (
        form.setValue(name, value, options)
      ), [form, name]
    );

    const onBlur = useCallback(() => form.touch(name), [form, name]);

    const bindInput = useCallback(() => ({
      name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => set((e?.target?.value ?? '') as T[K]),
      onBlur,
    }), [value, set, onBlur]);

    const bindTextInput = useCallback(() => ({
      value: (value ?? "") as any,
      onChangeText: (text: string) => set(text as T[K]),
      onBlur,
    }), [value, set, onBlur]);

    return {
      errors,
      touched,
      isValid,
      set,
      onBlur,
      bindInput,
      bindTextInput
    }
  }

  return {
    Provider,
    useForm,
    useFormField,
  }
}

export function doValidateField<T extends Record<string, any>, K extends keyof T>(
  validators: Validators<T> | undefined,
  values: T,
  key: K
): string[] {
  const fns = toArray(validators?.[key]) as Validator<T, K>[];
  if (!fns.length) return [];
  const val = values[key];
  const msgs = fns
    .map((fn) => fn(val, values))
    .filter((m): m is string => typeof m === "string" && m.length > 0);
  return msgs;
}

export function doAllValidators<T extends Record<string, any>>(
  validators: Validators<T> | undefined,
  values: T
): ValidationErrors<T> {
  if (!validators) return {};
  const out: ValidationErrors<T> = {};
  (Object.keys(values) as Array<keyof T>).forEach((key) => {
    const errs = doValidateField(validators, values, key);
    if (errs.length) out[key] = errs;
  });
  return out;
}
