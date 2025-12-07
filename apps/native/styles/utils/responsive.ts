/**
 * Responsive Utilities
 * 반응형 값 resolve 유틸리티
 */

import type { BreakpointKey, ResponsiveValue } from '../tokens/responsive';

const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/**
 * 현재 breakpoint에 맞는 값 반환 (모바일 퍼스트 상속)
 *
 * @example
 * const values = { xs: 16, md: 24, xl: 32 };
 * resolveResponsive(values, "xs")  // → 16
 * resolveResponsive(values, "sm")  // → 16 (xs 상속)
 * resolveResponsive(values, "md")  // → 24
 * resolveResponsive(values, "lg")  // → 24 (md 상속)
 * resolveResponsive(values, "xl")  // → 32
 */
export const resolveResponsive = <T>(
  values: ResponsiveValue<T>,
  currentBreakpoint: BreakpointKey,
): T => {
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  // 현재 → xs 방향으로 순회하며 정의된 값 찾기
  for (let i = currentIndex; i >= 0; i--) {
    const key = breakpointOrder[i];

    if (values[key] !== undefined) {
      return values[key]!;
    }
  }

  return values.xs;
};

/**
 * 반응형 값인지 체크
 */
export const isResponsiveValue = <T>(
  value: T | ResponsiveValue<T>,
): value is ResponsiveValue<T> => {
  return typeof value === 'object' && value !== null && 'xs' in value;
};
