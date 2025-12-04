/**
 * Responsive Types
 * 반응형 값 타입 정의
 */

/**
 * Breakpoint 키 타입
 * - xs: 작은 폰 (0~479px)
 * - sm: 폰 (480~767px)
 * - md: 태블릿 (768~1023px)
 * - lg: 큰 태블릿 (1024~1279px)
 * - xl: 데스크톱 (1280px+)
 */
export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * 반응형 값 타입
 * - xs는 필수 (모바일 퍼스트 기본값)
 * - 나머지 breakpoint는 선택적 (값이 바뀌는 지점만 정의)
 *
 * @example
 * { xs: 16 }                    // 모든 breakpoint에서 16
 * { xs: 16, md: 24 }            // xs~sm: 16, md~xl: 24
 * { xs: 16, md: 24, xl: 32 }    // xs~sm: 16, md~lg: 24, xl: 32
 */
export type ResponsiveValue<T> = { xs: T } & Partial<Record<BreakpointKey, T>>;
