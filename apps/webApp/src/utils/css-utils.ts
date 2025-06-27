export const toPxels = (value: string | number): string =>
  Number.isNaN(Number(value)) ? (value as string) : `${value}px`;
