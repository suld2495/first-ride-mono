import { appThemes, darkTheme, lightTheme } from '@/theme/themes';
import type { ThemeContract } from '@/theme/themes';
import type { BreakpointKey, ResponsiveValue } from '@/theme/responsive';
import { isResponsiveValue, resolveResponsive } from '@/theme/responsive.utils';

describe('theme module exports', () => {
  it('테마 파일을 theme 디렉토리에서 직접 제공한다', () => {
    expect(lightTheme.name).toBe('light');
    expect(darkTheme.name).toBe('dark');
    expect(appThemes.light).toBe(lightTheme);
    expect(appThemes.dark).toBe(darkTheme);
    expect(lightTheme.colors.brand.primary).toBe('#0984e3');
    expect(darkTheme.colors.brand.card).toBe('#2f3640');
  });

  it('반응형 타입과 유틸리티를 theme 디렉토리에서 제공한다', () => {
    const values: ResponsiveValue<number> = { xs: 16, md: 24 };
    const breakpoint: BreakpointKey = 'sm';
    const contract: ThemeContract = lightTheme;

    expect(contract.colors.text.primary).toBeTruthy();
    expect(isResponsiveValue(values)).toBe(true);
    expect(resolveResponsive(values, breakpoint)).toBe(16);
    expect(resolveResponsive(values, 'md')).toBe(24);
  });
});
