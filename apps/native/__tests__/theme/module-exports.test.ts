import {
  appThemes,
  darkTheme,
  greenTheme,
  lightTheme,
  redTheme,
} from '@/theme/themes';
import type { ThemeContract } from '@/theme/themes';
import type { BreakpointKey, ResponsiveValue } from '@/theme/responsive';
import { isResponsiveValue, resolveResponsive } from '@/theme/responsive.utils';

describe('theme module exports', () => {
  it('테마 파일을 theme 디렉토리에서 직접 제공한다', () => {
    expect(lightTheme.name).toBe('light');
    expect(darkTheme.name).toBe('dark');
    expect(greenTheme.name).toBe('green');
    expect(redTheme.name).toBe('red');
    expect(appThemes.light).toBe(lightTheme);
    expect(appThemes.dark).toBe(darkTheme);
    expect(appThemes.green).toBe(greenTheme);
    expect(appThemes.red).toBe(redTheme);
    expect(lightTheme.colors.brand.primary).toBe('#0984e3');
    expect(darkTheme.colors.brand.card).toBe('#2f3640');
    expect(appThemes.blue.colors.text.muted).toBe('#2C5171');
    expect(greenTheme.colors.text.muted).toBe('#416B58');
    expect(redTheme.colors.text.muted).toBe('#7A486E');
    expect(appThemes.blue.colors.text.soft).toBe('#6097C6');
    expect(greenTheme.colors.text.soft).toBe('#6D947E');
    expect(redTheme.colors.text.soft).toBe('#C178B0');
    expect(appThemes.blue.colors.brand.card).toBe('#E2F1FF');
    expect(greenTheme.colors.brand.card).toBe('#D4FFE9');
    expect(redTheme.colors.brand.card).toBe('#FFEBFA');
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
