import { FormState } from './useForm';
import { ValidationErrors } from '.';

export type Action<T> =
  | { type: 'SET_VALUE'; key: keyof T; value: unknown }
  | { type: 'TOUCH'; key: keyof T }
  | { type: 'SET_ERRORS'; errors: ValidationErrors<T> }
  | {
      type: 'SET_FIELD_ERRORS';
      key: keyof T;
      errors: string[];
      isValid: boolean;
    }
  | { type: 'RESET'; form: T };

export function formReducer<T>(
  state: FormState<T>,
  action: Action<T>,
): FormState<T> {
  switch (action.type) {
    case 'SET_VALUE': {
      const newForm = { ...state.form, [action.key]: action.value } as T;

      return { ...state, form: newForm };
    }
    case 'TOUCH': {
      return { ...state, touched: { ...state.touched, [action.key]: true } };
    }
    case 'SET_ERRORS': {
      return {
        ...state,
        errors: action.errors,
        enabled: Object.keys(action.errors).length === 0,
      };
    }
    case 'SET_FIELD_ERRORS': {
      const next = { ...state.errors } as ValidationErrors<T>;

      if (action.errors.length) next[action.key] = action.errors;
      else delete next[action.key];
      return {
        ...state,
        errors: next,
        enabled: action.isValid,
      };
    }
    case 'RESET': {
      return { form: action.form, touched: {}, errors: {}, enabled: false };
    }
    default:
      return state;
  }
}
