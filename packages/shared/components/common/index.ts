export type Validator<T, K extends keyof T> = (
  value: T[K],
  values: T,
) => string | null | undefined;

export type Validators<T> = Partial<{
  [K in keyof T]: Validator<T, K> | Validator<T, K>[];
}>;

export type ValidationErrors<T> = Partial<{ [K in keyof T]: string[] }>;
