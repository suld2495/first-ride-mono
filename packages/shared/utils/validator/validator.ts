export interface Validator {
  validate: (value: string) => boolean;
}

export class NumberValidator implements Validator {
  readonly #min: number;
  readonly #max: number;

  constructor({ min, max }: { min?: number; max?: number }) {
    this.#min = min || Number.MIN_SAFE_INTEGER;
    this.#max = max || Number.MAX_SAFE_INTEGER;
  }

  validate(value: string): boolean {
    const numberPattern = /^[0-9]+$/;
    const isNumber = numberPattern.test(value);

    return isNumber && this.#min <= Number(value) && Number(value) <= this.#max;
  }
}

type StringValidatorOptions = {
  minLength?: number;
  maxLength?: number;
};

export class StringValidator implements Validator {
  readonly #minLength: number;
  readonly #maxLength: number;

  constructor({ maxLength, minLength }: StringValidatorOptions) {
    this.#minLength = minLength || 0;
    this.#maxLength = maxLength || Number.MAX_SAFE_INTEGER;
  }

  validate(value: string): boolean {
    return value.length >= this.#minLength && value.length <= this.#maxLength;
  }
}

export class RequiredValidator implements Validator {
  validate(value: string): boolean {
    return value.toString().trim() !== '';
  }
}

export class PatternValidator implements Validator {
  readonly #pattern: RegExp;

  constructor(pattern: RegExp) {
    this.#pattern = pattern;
  }

  validate(value: string): boolean {
    return this.#pattern.test(value);
  }
}

export class CustomValidator implements Validator {
  readonly #validate: (value: string) => boolean;

  constructor(validate: (value: string) => boolean) {
    this.#validate = validate;
  }

  validate(value: string): boolean {
    return this.#validate(value);
  }
}
