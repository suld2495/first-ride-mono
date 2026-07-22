import { blueTheme, greenTheme, lightTheme, redTheme } from '@/theme/themes';
import {
  baseFoundation,
  createFoundation,
  getTypographyScaleForWidth,
  palette,
  spacing,
  tokens,
} from '@/theme/tokens';

describe('theme/tokens', () => {
  it('디자인 시스템 토큰 공개 API를 한 곳에서 제공한다', () => {
    expect(palette.stitch.primary).toBe('#1313ec');
    expect(baseFoundation.spacing[4]).toBe(16);
    expect(baseFoundation.spacing.px).toBe(1);
    expect(baseFoundation.spacing[0.5]).toBe(2);
    expect(baseFoundation.spacing[3.5]).toBe(14);
    expect(baseFoundation.spacing[96]).toBe(384);
    expect(spacing(2)).toBe(32);
    expect(tokens.space[4]).toBeDefined();
    expect(tokens.space.px).toBe(1);
    expect(tokens.space[0.5]).toBe(2);
    expect(baseFoundation.dimension.x20).toBe(20);
    expect(baseFoundation.dimension.x99).toBe(99);
    expect(baseFoundation.typography.size.caption3).toBe(11);
    expect(baseFoundation.typography.size.body1).toBe(16);
    expect(baseFoundation.typography.size.h0).toBe(40);
    expect(tokens.size.caption3).toBe(11);
    expect(tokens.size.subtitle1).toBe(20);
    expect(tokens.size.h0).toBe(40);
  });

  it('theme palette를 의미 단위로 그룹화한다', () => {
    expect(palette.theme.softBlue[20]).toBe('#A7CBEA');
    expect(palette.theme.softGreen[10]).toBe('#B9E9CF');
    expect(palette.theme.blue[50]).toBe('#107AD6');
    expect(palette.theme.gray[45]).toBe('#3F3F46');
    expect(palette.theme.gray[100]).toBe('#F5F5F5');
    expect(palette.theme.gray[300]).toBe('#D0D4DB');
    expect(palette.theme.gray[400]).toBe('#9BA2AE');
    expect(palette.theme.gray[500]).toBe('#6C727E');
    expect(palette.theme.gray[600]).toBe('#4B5666');
    expect(palette.theme.gray[700]).toBe('#364050');
    expect(palette.theme.gray[800]).toBe('#1F2937');
    expect(palette.theme.gray[900]).toBe('#121826');
    expect(palette.theme.gray[95]).toBe('#000306');
    expect(palette.theme.gray[200]).toBe('#E2E8F0');
    expect(palette.tag.critical[700]).toBe('#CA3E3E');
    expect('skinSoftBlue' in palette).toBe(false);
    expect('skinBlue' in palette).toBe(false);
    expect('skinGray' in palette).toBe(false);
  });

  it('루틴 오늘 완료 컬러를 같은 테마 톤 안에서 구분한다', () => {
    expect(lightTheme.colors.brand.selectedCheckbox).toBe('#0984e3');
    expect(lightTheme.colors.brand.todaySuccessCheckbox).toBe(
      palette.theme.blue[10],
    );
    expect(lightTheme.colors.brand.todaySuccessCheck).toBe(
      palette.theme.blue[80],
    );

    expect(blueTheme.colors.brand.todaySuccessCheckbox).toBe(
      palette.theme.blue[10],
    );
    expect(blueTheme.colors.brand.todaySuccessCheck).toBe(
      palette.theme.blue[80],
    );
    expect(greenTheme.colors.brand.todaySuccessCheckbox).toBe(
      palette.theme.green[10],
    );
    expect(greenTheme.colors.brand.todaySuccessCheck).toBe(
      palette.theme.green[80],
    );
    expect(redTheme.colors.brand.todaySuccessCheckbox).toBe(
      palette.theme.red[10],
    );
    expect(redTheme.colors.brand.todaySuccessCheck).toBe(palette.theme.red[80]);
  });

  it('테마별 foundation 토큰을 생성한다', () => {
    const foundation = createFoundation({
      name: 'brand',
      density: 'compact',
      radiusStyle: 'pill',
      typography: {
        scale: 1.1,
        fontFamily: {
          regular: 'System',
          medium: 'System',
          bold: 'System',
        },
      },
      colors: {
        background: {
          base: '#000',
          surface: '#111',
          elevated: '#222',
          sunken: '#333',
          overlay: 'rgba(0, 0, 0, 0.5)',
          input: '#111',
          media: '#111',
        },
        text: {
          primary: '#fff',
          secondary: '#ddd',
          tertiary: '#bbb',
          muted: '#aaa',
          soft: '#aaa',
          disabled: '#999',
          inverse: '#000',
          link: '#0af',
          gray: '#eee',
          title: '#fff',
          pageHeaderTitle: '#18191B',
          label: '#ddd',
          input: '#ddd',
        },
        action: {
          primary: {
            default: '#0af',
            pressed: '#08c',
            disabled: '#456',
            label: '#fff',
          },
          secondary: {
            default: '#123',
            pressed: '#234',
            disabled: '#345',
            label: '#456',
          },
          ghost: {
            default: 'transparent',
            pressed: '#111',
            disabled: 'transparent',
            label: '#fff',
          },
        },
        feedback: {
          success: { bg: '#0f0', text: '#060', border: '#0c0' },
          error: { bg: '#f00', text: '#600', border: '#c00' },
          warning: { bg: '#ff0', text: '#660', border: '#cc0' },
          info: { bg: '#00f', text: '#006', border: '#00c' },
        },
        tag: {
          critical: {
            700: '#CA3E3E',
          },
        },
        border: {
          default: '#111',
          strong: '#222',
          subtle: '#333',
          focus: '#444',
          divider: '#555',
          input: '#666',
        },
        field: {
          label: '#ddd',
          required: '#0af',
          optional: '#8cf',
          placeholder: '#bbb',
          text: '#ddd',
          icon: '#0af',
          border: '#666',
          background: '#111',
        },
        questDetail: {
          periodBackground: '#000',
          periodText: '#fff',
        },
        brand: {
          grey: '#999',
          background: '#000',
          backgroundGrey: '#111',
          primary: '#0af',
          secondary: '#0af',
          text: '#fff',
          textSecondary: '#ddd',
          icon: '#fff',
          button: '#0af',
          buttonLight: '#8cf',
          subButton: '#123',
          checkbox: '#0af',
          check: '#0af',
          selectedCheckbox: '#0af',
          selectedCheck: '#0af',
          todaySuccessCheckbox: '#def',
          todaySuccessCheck: '#003',
          pendingConfirmationCheckbox: '#ff9',
          pendingConfirmationCheck: '#cc0',
          input: '#111',
          error: '#f00',
          success: '#0f0',
          warning: '#ff0',
          info: '#00f',
          border: '#555',
          boxShadow: '0 1px 0 rgba(0,0,0,0.4)',
          foreground: '#fff',
          root: '#000',
          card: '#111',
          bottomTab: '#111',
          activeBottomTab: '#111',
          routineBorder: '#222',
          routineBackground: '#111',
        },
      },
    });

    expect(foundation.spacing[4]).toBeCloseTo(13.6);
    expect(foundation.spacing[0.5]).toBeCloseTo(1.7);
    expect(foundation.radii.m).toBe(9999);
    expect(foundation.typography.size.subtitle2).toBeCloseTo(19.8);
    expect(foundation.typography.size.h0).toBeCloseTo(44);
  });

  it('넓은 모바일 화면에서는 타이포그래피를 살짝 키운다', () => {
    expect(getTypographyScaleForWidth(360)).toBe(1);
    expect(getTypographyScaleForWidth(390)).toBe(1);
    expect(getTypographyScaleForWidth(430)).toBe(1.08);

    const foundation = createFoundation(lightTheme, 430);

    expect(foundation.typography.size.body1).toBeCloseTo(17.28);
    expect(foundation.typography.size.body2).toBeCloseTo(16.2);
  });
});
