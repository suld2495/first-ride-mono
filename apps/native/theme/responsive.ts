export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ResponsiveValue<T> = {
  xs: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};
