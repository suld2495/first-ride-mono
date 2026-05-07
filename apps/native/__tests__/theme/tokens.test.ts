import {
  baseFoundation,
  createFoundation,
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
    expect(palette.theme.blue[50]).toBe('#107AD6');
    expect(palette.theme.gray[95]).toBe('#000306');
    expect('skinSoftBlue' in palette).toBe(false);
    expect('skinBlue' in palette).toBe(false);
    expect('skinGray' in palette).toBe(false);
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
        border: {
          default: '#111',
          strong: '#222',
          subtle: '#333',
          focus: '#444',
          divider: '#555',
          input: '#666',
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
});
