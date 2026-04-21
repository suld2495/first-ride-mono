import type { BreakpointKey, ResponsiveValue } from '@/theme/responsive';

const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export const resolveResponsive = <T>(
  values: ResponsiveValue<T>,
  currentBreakpoint: BreakpointKey,
): T => {
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  for (let i = currentIndex; i >= 0; i--) {
    const key = breakpointOrder[i];

    if (values[key] !== undefined) {
      return values[key]!;
    }
  }

  return values.xs;
};

export const isResponsiveValue = <T>(
  value: T | ResponsiveValue<T>,
): value is ResponsiveValue<T> => {
  return typeof value === 'object' && value !== null && 'xs' in value;
};
