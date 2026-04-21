# Design System Guide

> Unistyles 3.0 기반 React Native **스킨/테마 기반 디자인 시스템 구축 가이드**
> 색상뿐 아니라 **타이포그래피, spacing, radius까지 스킨에 따라 변경 가능**한 구조를 목표로 한다.

---

## 목차

1. [개요](#1-개요)
2. [설치](#2-설치)
3. [폴더 구조](#3-폴더-구조)
4. [토큰 정의](#4-토큰-정의)
5. [반응형 시스템](#5-반응형-시스템)
6. [테마 정의](#6-테마-정의)
7. [Unistyles 설정](#7-unistyles-설정)
8. [사용 예시](#8-사용-예시)
9. [새 스킨 추가 방법](#9-새-스킨-추가-방법)
10. [핵심 원칙](#10-핵심-원칙)
11. [부록: 파일 체크리스트](#부록-파일-체크리스트)

---

## 1. 개요

### 목적

- **스킨 시스템**: 앱 전체 디자인(색, 타이포, spacing, radius)을 런타임에 손쉽게 전환
- **2-Layer 토큰 구조**: Raw(Primitive) → Semantic으로 의미 있는 계층화
- **반응형 지원**: breakpoint 기반 레이아웃/타이포 자동 조절
- **제한된 설정 + 확장성**:
  - 프로덕트 레벨에서 일관성 유지
  - 스킨별로 필요한 범위 내에서 커스터마이징 허용
- **타입 안전성**: TypeScript로 누락/오타를 컴파일 타임에 검출
- **컴포넌트 독립성**: 컴포넌트별 스타일은 각 컴포넌트에서 직접 관리

### 왜 Unistyles 3.0인가?

- **리렌더 없음**: C++ 레벨에서 Shadow Tree 직접 업데이트
- **StyleSheet API 호환**: 기존 코드 마이그레이션 용이
- **성능 최상위**: StyleSheet에 0.1ms 미만 오버헤드
- **테마 시스템 내장**: 단일 함수 호출로 스킨 전환
- **Breakpoints 내장**: 반응형 스타일 네이티브 지원
- **런타임 값 지원**: Safe Area, 키보드 insets, 화면 크기 등

### 2-Layer Token 구조

```text
Primitive (Raw)        →  Semantic (의미)
──────────────────────────────────────────────────────
blue.600               →  action.primary (버튼 배경)
gray.900               →  text.primary (주요 텍스트)
16                     →  spacing.m (중간 여백)
radii.m                →  radius.medium (중간 모서리)
typography.size.m      →  body.medium (본문 크기)
```

> **컴포넌트 레이어 제거**: 버튼, 인풋 등 컴포넌트별 스타일 토큰은
> 각 컴포넌트 파일에서 직접 정의한다. 이는 컴포넌트가 많아질수록
> 중앙 집중식 관리가 비효율적이고, 각 컴포넌트에서 관리하는 것이
> 더 직관적이기 때문이다.

---

## 2. 설치

```bash
# Unistyles 3.0 설치
npm install react-native-unistyles react-native-nitro-modules

# iOS
cd ios && pod install

# 또는 Expo (CNG 필요)
npx expo prebuild
```

> ⚠️ **주의**: Unistyles 3.0은 Expo Go를 지원하지 않는다.  
> `expo prebuild`를 통해 네이티브 빌드가 필요하다.

---

## 3. 폴더 구조

> **주의**: 이 디자인 시스템은 `apps/native` 전용이다.
> 기존 `packages/design-system`은 삭제하고 이 구조로 통합한다.

```text
apps/native/
├── styles/                         # 디자인 시스템 루트
│   ├── tokens/
│   │   ├── palette.ts              # Raw 색상 (내부용)
│   │   ├── foundation.base.ts      # 스킨 공통 base 토큰
│   │   ├── foundation.ts           # theme 기반 foundation 생성 (createFoundation)
│   │   ├── responsive.ts           # 반응형 타입 정의
│   │   └── index.ts                # tokens export
│   │
│   ├── themes/
│   │   ├── theme.contract.ts       # 테마 타입 계약 (스킨 공통 인터페이스)
│   │   ├── light.ts                # 라이트 스킨
│   │   ├── dark.ts                 # 다크 스킨
│   │   ├── brand.ts                # 브랜드/커스텀 스킨 (선택)
│   │   └── index.ts                # themes export, ThemeName 정의
│   │
│   ├── utils/
│   │   └── responsive.ts           # 반응형 값 resolve 유틸리티
│   │
│   ├── unistyles.ts                # UnistylesRegistry 설정 (themes + foundation 병합)
│   ├── unistyles.d.ts              # UnistylesThemes 타입 선언 확장
│   └── index.ts                    # 통합 export
│
├── components/                     # 컴포넌트 (각자 스타일 관리)
│   ├── Button.tsx                  # 버튼 사이즈/variant는 여기서 정의
│   ├── Input.tsx                   # 인풋 사이즈는 여기서 정의
│   └── ...
│
└── app/                            # 앱 진입점
    └── _layout.tsx                 # unistyles import
```

### 기존 구조 대비 변경점

| 기존 | 변경 |
|------|------|
| `packages/design-system/` | 삭제 (native 전용으로 통합) |
| `apps/native/design-system/` | `apps/native/styles/`로 변경 |
| `apps/native/theme/` | 삭제 (styles/themes로 대체) |
| `styles/components/tokens.ts` | 삭제 (각 컴포넌트에서 관리) |

---

## 4. 토큰 정의

### 4.1 palette.ts (Raw 색상)

> ⚠️ **내부 전용**: 컴포넌트에서 직접 import 금지. 오직 theme 정의에서만 참조한다.

```ts
// styles/tokens/palette.ts

export const palette = {
  white: "#FFFFFF",
  black: "#000000",

  gray: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  blue: {
    50: "#E3F2FD",
    100: "#BBDEFB",
    200: "#90CAF9",
    300: "#64B5F6",
    400: "#42A5F5",
    500: "#2196F3",
    600: "#1E88E5",
    700: "#1976D2",
    800: "#1565C0",
    900: "#0D47A1",
  },

  red: {
    50: "#FFEBEE",
    100: "#FFCDD2",
    200: "#EF9A9A",
    300: "#E57373",
    400: "#EF5350",
    500: "#F44336",
    600: "#E53935",
    700: "#D32F2F",
    800: "#C62828",
    900: "#B71C1C",
  },

  green: {
    50: "#E8F5E9",
    100: "#C8E6C9",
    200: "#A5D6A7",
    300: "#81C784",
    400: "#66BB6A",
    500: "#4CAF50",
    600: "#43A047",
    700: "#388E3C",
    800: "#2E7D32",
    900: "#1B5E20",
  },

  yellow: {
    50: "#FFFDE7",
    100: "#FFF9C4",
    200: "#FFF59D",
    300: "#FFF176",
    400: "#FFEE58",
    500: "#FFEB3B",
    600: "#FDD835",
    700: "#FBC02D",
    800: "#F9A825",
    900: "#F57F17",
  },
} as const;
```

### 4.2 responsive.ts (반응형 타입)

```ts
// styles/tokens/responsive.ts

import type { baseFoundation } from "./foundation.base";

export type BreakpointKey = keyof typeof baseFoundation.breakpoints;

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
```

### 4.3 foundation.base.ts (스킨 공통 base 토큰)

> 스킨이 바뀌어도 **기본 스케일**은 유지되지만, 스킨에 따라 scale/override가 가능하다.

```ts
// styles/tokens/foundation.base.ts

import type { ResponsiveValue } from "./responsive";

export const baseFoundation = {
  // ─────────────────────────────────────────────────────────────
  // Spacing
  // ─────────────────────────────────────────────────────────────
  spacing: {
    none: 0,
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  // ─────────────────────────────────────────────────────────────
  // Border Radius
  // ─────────────────────────────────────────────────────────────
  radii: {
    none: 0,
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 9999,
  },

  // ─────────────────────────────────────────────────────────────
  // Typography
  // ─────────────────────────────────────────────────────────────
  typography: {
    size: {
      xs: 10,
      s: 12,
      m: 14,
      l: 16,
      xl: 20,
      xxl: 24,
      title: 32,
    },
    weight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Shadow
  // ─────────────────────────────────────────────────────────────
  shadow: {
    s: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    m: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    l: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Motion / Animation
  // ─────────────────────────────────────────────────────────────
  motion: {
    duration: {
      instant: 100,
      fast: 150,
      normal: 250,
      slow: 400,
      slower: 600,
    },
    easing: {
      linear: [0, 0, 1, 1] as const,
      easeIn: [0.4, 0, 1, 1] as const,
      easeOut: [0, 0, 0.2, 1] as const,
      easeInOut: [0.4, 0, 0.2, 1] as const,
      // React Native Animated에서 사용:
      // Easing.bezier(...theme.foundation.motion.easing.easeOut)
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Z-Index (레이어 순서)
  // ─────────────────────────────────────────────────────────────
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800,
  },

  // ─────────────────────────────────────────────────────────────
  // Breakpoints (반응형)
  // ─────────────────────────────────────────────────────────────
  breakpoints: {
    xs: 0,      // 작은 폰
    sm: 480,    // 폰
    md: 768,    // 태블릿
    lg: 1024,   // 큰 태블릿
    xl: 1280,   // 데스크톱
  },

  // ─────────────────────────────────────────────────────────────
  // Opacity
  // ─────────────────────────────────────────────────────────────
  opacity: {
    transparent: 0,
    disabled: 0.4,
    subtle: 0.6,
    medium: 0.8,
    solid: 1,
  },

  // ─────────────────────────────────────────────────────────────
  // Icon Size
  // ─────────────────────────────────────────────────────────────
  iconSize: {
    xs: 12,
    s: 16,
    m: 20,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  // ─────────────────────────────────────────────────────────────
  // Responsive Values (breakpoint별 값이 다른 토큰)
  // - xs는 필수, 값이 바뀌는 breakpoint만 추가 정의
  // - 모바일 퍼스트: 정의되지 않은 breakpoint는 이전 값 상속
  // ─────────────────────────────────────────────────────────────
  responsive: {
    // Layout
    containerPadding: { xs: 16, md: 24, xl: 32 } as ResponsiveValue<number>,
    sectionGap: { xs: 24, md: 40, lg: 56 } as ResponsiveValue<number>,
    gridGutter: { xs: 12, md: 20 } as ResponsiveValue<number>,
    maxContentWidth: { xs: -1, md: 720, lg: 960, xl: 1200 } as ResponsiveValue<number>, // -1 = 100%

    // Typography
    pageTitle: { xs: 24, md: 32, lg: 40 } as ResponsiveValue<number>,
    sectionTitle: { xs: 18, md: 22 } as ResponsiveValue<number>,
  },
} as const;
```

### 4.4 foundation.ts (theme 기반 foundation 생성)

> 스킨마다 UI **밀도(density)**, **radius 스타일**, **타이포 스케일**을 변경할 수 있도록 한다.

```ts
// styles/tokens/foundation.ts

import { baseFoundation } from "./foundation.base";
import type { ThemeContract } from "../themes/theme.contract";

export const createFoundation = (theme: ThemeContract) => {
  // UI 밀도에 따른 spacing 스케일
  const densityScale =
    theme.density === "compact" ? 0.85 :
    theme.density === "spacious" ? 1.15 :
    1;

  const typographyScale = theme.typography?.scale ?? 1;

  const spacing = Object.fromEntries(
    Object.entries(baseFoundation.spacing).map(([k, v]) => [
      k,
      (v as number) * densityScale,
    ]),
  ) as typeof baseFoundation.spacing;

  const radii = (() => {
    if (theme.radiusStyle === "sharp") {
      return {
        ...baseFoundation.radii,
        s: 0,
        m: 0,
        l: 0,
      } as typeof baseFoundation.radii;
    }

    if (theme.radiusStyle === "pill") {
      return {
        ...baseFoundation.radii,
        s: 9999,
        m: 9999,
        l: 9999,
      } as typeof baseFoundation.radii;
    }

    // 기본 rounded
    return baseFoundation.radii;
  })();

  const typography = {
    ...baseFoundation.typography,
    size: Object.fromEntries(
      Object.entries(baseFoundation.typography.size).map(([k, v]) => [
        k,
        (v as number) * typographyScale,
      ]),
    ) as typeof baseFoundation.typography.size,
    // 스킨별 폰트 패밀리
    fontFamily: theme.typography?.fontFamily ?? {
      regular: "System",
      medium: "System",
      bold: "System",
    },
  };

  // 스킨 불변 토큰들
  const { shadow, motion, zIndex, breakpoints, opacity, iconSize, responsive } =
    baseFoundation;

  return {
    spacing,
    radii,
    typography,
    shadow,
    motion,
    zIndex,
    breakpoints,
    opacity,
    iconSize,
    responsive,
  } as const;
};

// spacing 헬퍼
export const spacing = (multiplier: number) =>
  baseFoundation.spacing.m * multiplier;
```

---

## 5. 반응형 시스템

### 5.1 반응형 유틸리티

```ts
// styles/utils/responsive.ts

import type { ResponsiveValue, BreakpointKey } from "../tokens/responsive";
import { baseFoundation } from "../tokens/foundation.base";

const breakpointOrder: BreakpointKey[] = ["xs", "sm", "md", "lg", "xl"];

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
  currentBreakpoint: BreakpointKey
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
  value: T | ResponsiveValue<T>
): value is ResponsiveValue<T> => {
  return (
    typeof value === "object" &&
    value !== null &&
    "xs" in value
  );
};
```

### 5.2 반응형 상속 규칙

```text
정의: { xs: 16, md: 24, xl: 32 }

Breakpoint │ 적용 값 │ 이유
───────────┼─────────┼─────────────────
    xs     │   16    │ xs에서 정의됨
    sm     │   16    │ xs 값 상속
    md     │   24    │ md에서 정의됨
    lg     │   24    │ md 값 상속
    xl     │   32    │ xl에서 정의됨
```

---

## 6. 테마 정의

### 6.1 theme.contract.ts (타입 계약)

> 모든 스킨이 반드시 구현해야 하는 **공통 인터페이스**.
> 여기서 스킨별로 변경 가능한 범위를 명확히 정의한다.

```ts
// styles/themes/theme.contract.ts

export type ThemeDensity = "compact" | "comfortable" | "spacious";
export type ThemeRadiusStyle = "sharp" | "rounded" | "pill";

export type ThemeContract = {
  name: string;

  /**
   * UI 밀도 (spacing 전체에 영향을 주는 스킨 설정)
   * - compact   : 더 조밀한 인터페이스
   * - comfortable: 기본값
   * - spacious  : 여백이 더 넓은 인터페이스
   */
  density?: ThemeDensity;

  /**
   * 모서리 스타일
   * - sharp   : 각진 스타일 (0에 가깝게)
   * - rounded : 기본 둥근 모서리
   * - pill    : pill 형태에 가까운 모서리
   */
  radiusStyle?: ThemeRadiusStyle;

  /**
   * 타이포그래피 스킨 설정
   * - fontFamily: 스킨별 폰트 패밀리
   * - scale    : 전체 폰트 크기 배율 (ex: 0.95, 1.0, 1.1)
   */
  typography?: {
    fontFamily?: {
      regular: string;
      medium?: string;
      bold?: string;
    };
    scale?: number;
  };

  colors: {
    // Background (Layer)
    background: {
      base: string;      // 전체 화면 배경
      surface: string;   // 카드, 리스트 아이템 배경
      elevated: string;  // 모달, 드롭다운 배경
      sunken: string;    // 입력창 내부
      overlay: string;   // 딤드 처리
    };

    // Text (Hierarchy)
    text: {
      primary: string;   // 제목, 본문
      secondary: string; // 부가 설명
      tertiary: string;  // 비활성, placeholder
      inverse: string;   // 어두운 배경 위 텍스트
      link: string;      // 링크
    };

    // Action (Interactive)
    action: {
      primary: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
      secondary: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
      ghost: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
    };

    // Feedback (Status)
    feedback: {
      success: { bg: string; text: string; border: string };
      error: { bg: string; text: string; border: string };
      warning: { bg: string; text: string; border: string };
      info: { bg: string; text: string; border: string };
    };

    // Border
    border: {
      default: string;
      strong: string;
      subtle: string;
      focus: string;
    };
  };
};
```

### 6.2 light.ts (라이트 테마)

```ts
// styles/themes/light.ts

import { palette } from "../tokens/palette";
import type { ThemeContract } from "./theme.contract";

export const lightTheme: ThemeContract = {
  name: "light",

  density: "comfortable",
  radiusStyle: "rounded",
  typography: {
    fontFamily: {
      regular: "System",
      medium: "System",
      bold: "System",
    },
    scale: 1,
  },

  colors: {
    background: {
      base: palette.white,
      surface: palette.gray[50],
      elevated: palette.white,
      sunken: palette.gray[100],
      overlay: "rgba(0, 0, 0, 0.5)",
    },

    text: {
      primary: palette.gray[900],
      secondary: palette.gray[600],
      tertiary: palette.gray[400],
      inverse: palette.white,
      link: palette.blue[600],
    },

    action: {
      primary: {
        default: palette.blue[600],
        pressed: palette.blue[800],
        disabled: palette.gray[300],
        label: palette.white,
      },
      secondary: {
        default: palette.blue[50],
        pressed: palette.blue[100],
        disabled: palette.gray[100],
        label: palette.blue[700],
      },
      ghost: {
        default: "transparent",
        pressed: palette.gray[100],
        disabled: "transparent",
        label: palette.gray[700],
      },
    },

    feedback: {
      success: {
        bg: palette.green[50],
        text: palette.green[700],
        border: palette.green[200],
      },
      error: {
        bg: palette.red[50],
        text: palette.red[700],
        border: palette.red[200],
      },
      warning: {
        bg: palette.yellow[50],
        text: palette.yellow[900],
        border: palette.yellow[200],
      },
      info: {
        bg: palette.blue[50],
        text: palette.blue[700],
        border: palette.blue[200],
      },
    },

    border: {
      default: palette.gray[300],
      strong: palette.gray[500],
      subtle: palette.gray[200],
      focus: palette.blue[500],
    },
  },
};
```

### 6.3 dark.ts (다크 테마)

```ts
// styles/themes/dark.ts

import { palette } from "../tokens/palette";
import type { ThemeContract } from "./theme.contract";

export const darkTheme: ThemeContract = {
  name: "dark",

  density: "compact",
  radiusStyle: "rounded",
  typography: {
    fontFamily: {
      regular: "System",
      medium: "System",
      bold: "System",
    },
    scale: 0.95,
  },

  colors: {
    background: {
      base: palette.gray[900],
      surface: palette.gray[800],
      elevated: palette.gray[800],
      sunken: palette.black,
      overlay: "rgba(0, 0, 0, 0.7)",
    },

    text: {
      primary: palette.gray[50],
      secondary: palette.gray[400],
      tertiary: palette.gray[600],
      inverse: palette.gray[900],
      link: palette.blue[400],
    },

    action: {
      primary: {
        default: palette.blue[500],
        pressed: palette.blue[600],
        disabled: palette.gray[700],
        label: palette.white,
      },
      secondary: {
        default: palette.blue[900],
        pressed: palette.blue[800],
        disabled: palette.gray[800],
        label: palette.blue[300],
      },
      ghost: {
        default: "transparent",
        pressed: palette.gray[800],
        disabled: "transparent",
        label: palette.gray[300],
      },
    },

    feedback: {
      success: {
        bg: palette.green[900],
        text: palette.green[300],
        border: palette.green[700],
      },
      error: {
        bg: palette.red[900],
        text: palette.red[300],
        border: palette.red[700],
      },
      warning: {
        bg: palette.yellow[900],
        text: palette.yellow[300],
        border: palette.yellow[700],
      },
      info: {
        bg: palette.blue[900],
        text: palette.blue[300],
        border: palette.blue[700],
      },
    },

    border: {
      default: palette.gray[700],
      strong: palette.gray[500],
      subtle: palette.gray[800],
      focus: palette.blue[400],
    },
  },
};
```

### 6.4 themes/index.ts (Export)

```ts
// styles/themes/index.ts

import { lightTheme } from "./light";
import { darkTheme } from "./dark";
// import { brandTheme } from "./brand"; // 필요 시 추가

export { lightTheme, darkTheme };
export type { ThemeContract, ThemeDensity, ThemeRadiusStyle } from "./theme.contract";

// 사용 가능한 스킨 목록 (제한된 설정)
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  // brand: brandTheme,
} as const;

export type ThemeName = keyof typeof themes;
```

---

## 7. Unistyles 설정

### 7.1 unistyles.ts (Registry)

```ts
// styles/unistyles.ts

import { StyleSheet } from "react-native-unistyles";
import { themes } from "./themes";
import { createFoundation } from "./tokens/foundation";
import { baseFoundation } from "./tokens/foundation.base";

// 테마 + foundation 병합
type AppTheme = (typeof themes)[keyof typeof themes] & {
  foundation: ReturnType<typeof createFoundation>;
};

const enhancedThemes = Object.fromEntries(
  Object.entries(themes).map(([key, theme]) => [
    key,
    { ...theme, foundation: createFoundation(theme) },
  ]),
) as Record<keyof typeof themes, AppTheme>;

// Unistyles 설정
StyleSheet.configure({
  themes: enhancedThemes,
  breakpoints: baseFoundation.breakpoints,  // breakpoints 등록
  settings: {
    adaptiveThemes: true, // 디바이스 설정 따라 light/dark 자동 전환
    // 또는 initialTheme: "light" 로 고정
  },
});

export { StyleSheet };
```

### 7.2 unistyles.d.ts (타입 선언)

```ts
// styles/unistyles.d.ts

import type { themes } from "./themes";
import type { createFoundation } from "./tokens/foundation";
import type { baseFoundation } from "./tokens/foundation.base";

type AppThemes = {
  [K in keyof typeof themes]: (typeof themes)[K] & {
    foundation: ReturnType<typeof createFoundation>;
  };
};

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends typeof baseFoundation.breakpoints {}
}
```

---

## 8. 사용 예시

### 8.1 앱 진입점

```ts
// app/_layout.tsx

// 🔥 중요: 앱 최상단에서 unistyles 설정 import
import "../styles/unistyles";

export default function App() {
  return (
    // ThemeProvider 불필요 (Unistyles가 자동 처리)
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
```

### 8.2 기본 스타일 사용

```ts
import { View, Text } from "react-native";
import { StyleSheet } from "../styles/unistyles";

export function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.foundation.radii.m,
    padding: theme.foundation.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...theme.foundation.shadow.m,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.foundation.typography.size.l,
    fontWeight: theme.foundation.typography.weight.bold,
    marginBottom: theme.foundation.spacing.s,
  },
}));
```

### 8.3 반응형 스타일 사용

```ts
import { View, Text } from "react-native";
import { StyleSheet } from "../styles/unistyles";
import { resolveResponsive } from "../styles/utils/responsive";
import type { BreakpointKey } from "../styles/tokens/responsive";

export function PageContainer({ children }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create((theme, rt) => {
  const bp = rt.breakpoint as BreakpointKey;
  const r = theme.foundation.responsive;

  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.base,
      paddingHorizontal: resolveResponsive(r.containerPadding, bp),
      paddingTop: rt.insets.top,
    },

    section: {
      marginBottom: resolveResponsive(r.sectionGap, bp),
    },

    pageTitle: {
      fontSize: resolveResponsive(r.pageTitle, bp),
      fontWeight: theme.foundation.typography.weight.bold,
      color: theme.colors.text.primary,
    },

    // Unistyles 네이티브 breakpoint 문법도 사용 가능
    grid: {
      flexDirection: {
        xs: "column",
        md: "row",
      },
      gap: resolveResponsive(r.gridGutter, bp),
    },
  };
});
```

### 8.4 애니메이션 사용

```ts
import { Animated, Easing } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export function FadeInView({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const theme = UnistylesRuntime.getTheme();

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: theme.foundation.motion.duration.normal,
      easing: Easing.bezier(...theme.foundation.motion.easing.easeOut),
      useNativeDriver: true,
    }).start();
  }, []);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
```

### 8.5 z-index 사용

```ts
const styles = StyleSheet.create((theme) => ({
  dropdown: {
    position: "absolute",
    zIndex: theme.foundation.zIndex.dropdown,
    backgroundColor: theme.colors.background.elevated,
    ...theme.foundation.shadow.m,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: theme.foundation.zIndex.modalBackdrop,
    backgroundColor: theme.colors.background.overlay,
  },

  modal: {
    position: "absolute",
    zIndex: theme.foundation.zIndex.modal,
    backgroundColor: theme.colors.background.elevated,
  },

  toast: {
    position: "absolute",
    zIndex: theme.foundation.zIndex.toast,
    bottom: 20,
  },
}));
```

### 8.6 opacity 사용

```ts
const styles = StyleSheet.create((theme) => ({
  disabledButton: {
    opacity: theme.foundation.opacity.disabled,
  },

  subtleText: {
    opacity: theme.foundation.opacity.subtle,
  },

  backdrop: {
    backgroundColor: theme.colors.background.overlay,
    // overlay 색상 자체에 alpha가 있으므로 추가 opacity 불필요
  },
}));
```

### 8.7 아이콘 크기 사용

```ts
import { SomeIcon } from "some-icon-library";
import { StyleSheet } from "../styles/unistyles";

const styles = StyleSheet.create((theme) => ({
  smallIcon: {
    width: theme.foundation.iconSize.s,
    height: theme.foundation.iconSize.s,
  },

  standardIcon: {
    width: theme.foundation.iconSize.m,
    height: theme.foundation.iconSize.m,
  },

  largeIcon: {
    width: theme.foundation.iconSize.xl,
    height: theme.foundation.iconSize.xl,
  },
}));

// 또는 컴포넌트에서 직접
function IconButton() {
  return (
    <Pressable style={styles.button}>
      <SomeIcon size={theme.foundation.iconSize.m} />
    </Pressable>
  );
}
```

### 8.8 Button 컴포넌트 (컴포넌트 내부에서 사이즈 정의)

> 컴포넌트별 사이즈/variant 토큰은 각 컴포넌트 파일 내부에서 직접 정의한다.
> 이는 컴포넌트가 많아질수록 중앙 집중식 관리가 비효율적이기 때문이다.

```ts
// components/Button.tsx

import { Pressable, Text } from "react-native";
import { StyleSheet } from "../styles/unistyles";

// 컴포넌트 내부에서 사이즈 토큰 정의
type ButtonSize = "s" | "m" | "l";
type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  title: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
};

export function Button({
  title,
  size = "m",
  variant = "primary",
  disabled = false,
  onPress,
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles.sizes[size],
        styles.variants[variant][disabled ? "disabled" : pressed ? "pressed" : "default"],
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.label, styles.labelVariants[variant][disabled ? "disabled" : "default"]]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  // 사이즈별 토큰 (컴포넌트 내부에서 정의)
  sizes: {
    s: {
      height: 32,
      paddingHorizontal: theme.foundation.spacing.m,
      borderRadius: theme.foundation.radii.s,
    },
    m: {
      height: 44,
      paddingHorizontal: theme.foundation.spacing.l,
      borderRadius: theme.foundation.radii.m,
    },
    l: {
      height: 52,
      paddingHorizontal: theme.foundation.spacing.xl,
      borderRadius: theme.foundation.radii.m,
    },
  },

  // Variant별 색상
  variants: {
    primary: {
      default: { backgroundColor: theme.colors.action.primary.default },
      pressed: { backgroundColor: theme.colors.action.primary.pressed },
      disabled: { backgroundColor: theme.colors.action.primary.disabled },
    },
    secondary: {
      default: { backgroundColor: theme.colors.action.secondary.default },
      pressed: { backgroundColor: theme.colors.action.secondary.pressed },
      disabled: { backgroundColor: theme.colors.action.secondary.disabled },
    },
    ghost: {
      default: { backgroundColor: theme.colors.action.ghost.default },
      pressed: { backgroundColor: theme.colors.action.ghost.pressed },
      disabled: { backgroundColor: theme.colors.action.ghost.disabled },
    },
  },

  label: {
    fontWeight: theme.foundation.typography.weight.semibold,
    fontSize: theme.foundation.typography.size.m,
  },

  labelVariants: {
    primary: {
      default: { color: theme.colors.action.primary.label },
      disabled: { color: theme.colors.text.tertiary },
    },
    secondary: {
      default: { color: theme.colors.action.secondary.label },
      disabled: { color: theme.colors.text.tertiary },
    },
    ghost: {
      default: { color: theme.colors.action.ghost.label },
      disabled: { color: theme.colors.text.tertiary },
    },
  },
}));
```

### 8.9 테마 전환

```ts
import { UnistylesRuntime } from "react-native-unistyles";

// 현재 테마 확인
const currentTheme = UnistylesRuntime.themeName; // 'light' | 'dark' | 'brand' ...

// 테마 전환
function toggleTheme() {
  const current = UnistylesRuntime.themeName;
  UnistylesRuntime.setTheme(current === "light" ? "dark" : "light");
}

// 특정 테마로 변경
UnistylesRuntime.setTheme("brand");

// 디바이스 색상 모드 확인
const colorScheme = UnistylesRuntime.colorScheme; // 'dark' | 'light' | 'unspecified'

// 현재 breakpoint 확인
const breakpoint = UnistylesRuntime.breakpoint; // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
```

### 8.10 런타임 값 활용 예시

```ts
const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.base,
    paddingTop: rt.insets.top,      // Safe Area
    paddingBottom: rt.insets.bottom,
  },

  responsiveText: {
    fontSize:
      rt.screen.width > theme.foundation.breakpoints.md
        ? theme.foundation.typography.size.l
        : theme.foundation.typography.size.m,
  },

  keyboardAvoiding: {
    transform: [{ translateY: rt.insets.ime * -1 }], // 키보드 높이
  },
}));
```

---

## 9. 새 스킨 추가 방법

### Step 1: 테마 파일 생성 (예: brand.ts)

```ts
// styles/themes/brand.ts

import { palette } from "../tokens/palette";
import type { ThemeContract } from "./theme.contract";

const brandPrimary = {
  50: "#FFF0F5",
  100: "#FFE0EB",
  200: "#FFB3C8",
  300: "#FF80A6",
  400: "#FF4D83",
  500: "#E91E63",
  600: "#C2185B",
  700: "#AD1457",
};

export const brandTheme: ThemeContract = {
  name: "brand",

  density: "comfortable",
  radiusStyle: "pill",
  typography: {
    fontFamily: {
      regular: "Pretendard-Regular",
      medium: "Pretendard-Medium",
      bold: "Pretendard-Bold",
    },
    scale: 1.05,
  },

  colors: {
    background: {
      base: palette.white,
      surface: brandPrimary[50],
      elevated: palette.white,
      sunken: palette.gray[100],
      overlay: "rgba(233, 30, 99, 0.3)", // 브랜드 컬러 오버레이
    },

    text: {
      primary: palette.gray[900],
      secondary: palette.gray[600],
      tertiary: palette.gray[400],
      inverse: palette.white,
      link: brandPrimary[500],
    },

    action: {
      primary: {
        default: brandPrimary[500],
        pressed: brandPrimary[600],
        disabled: palette.gray[300],
        label: palette.white,
      },
      secondary: {
        default: brandPrimary[50],
        pressed: brandPrimary[100],
        disabled: palette.gray[100],
        label: brandPrimary[600],
      },
      ghost: {
        default: "transparent",
        pressed: palette.gray[100],
        disabled: "transparent",
        label: brandPrimary[600],
      },
    },

    feedback: {
      success: {
        bg: palette.green[50],
        text: palette.green[700],
        border: palette.green[200],
      },
      error: {
        bg: palette.red[50],
        text: palette.red[700],
        border: palette.red[200],
      },
      warning: {
        bg: palette.yellow[50],
        text: palette.yellow[900],
        border: palette.yellow[200],
      },
      info: {
        bg: brandPrimary[50],
        text: brandPrimary[600],
        border: brandPrimary[200],
      },
    },

    border: {
      default: palette.gray[300],
      strong: palette.gray[500],
      subtle: palette.gray[200],
      focus: brandPrimary[500],
    },
  },
};
```

### Step 2: themes/index.ts에 등록

```ts
// styles/themes/index.ts

import { lightTheme } from "./light";
import { darkTheme } from "./dark";
import { brandTheme } from "./brand";

export { lightTheme, darkTheme, brandTheme };

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  brand: brandTheme,
} as const;

export type ThemeName = keyof typeof themes;
```

### Step 3: 사용

```ts
import { UnistylesRuntime } from "react-native-unistyles";

// 브랜드 테마로 전환
UnistylesRuntime.setTheme("brand");
```

> ✅ TypeScript가 `ThemeContract`에 맞지 않는 속성/누락을 자동 검출해 준다.

---

## 10. 핵심 원칙

### ✅ DO (해야 할 것)

| 원칙 | 예시 |
|------|------|
| 색상은 테마에서만 참조 | `theme.colors.text.primary` |
| spacing은 foundation에서 참조 | `theme.foundation.spacing.m` |
| radius는 foundation에서 참조 | `theme.foundation.radii.m` |
| 타이포 size/weight는 foundation에서 참조 | `theme.foundation.typography.size.m` |
| 애니메이션 duration은 motion에서 참조 | `theme.foundation.motion.duration.normal` |
| 레이어 순서는 zIndex에서 참조 | `theme.foundation.zIndex.modal` |
| 투명도는 opacity에서 참조 | `theme.foundation.opacity.disabled` |
| 아이콘 크기는 iconSize에서 참조 | `theme.foundation.iconSize.m` |
| 반응형 값은 resolveResponsive로 참조 | `resolveResponsive(r.containerPadding, bp)` |
| 스킨별 차이는 ThemeContract로 정의 | `density`, `radiusStyle`, `typography` |
| 컴포넌트 사이즈는 해당 컴포넌트에서 정의 | `styles.sizes.m` (Button.tsx 내부) |
| 새 스킨은 ThemeContract 구현 + themes에 등록 | `themes.brand = brandTheme` |

### ❌ DON'T (하지 말아야 할 것)

| 원칙 | 예시 |
|------|------|
| 직접 hex 코드 사용 | ~~`backgroundColor: "#FF0000"`~~ |
| 임의 숫자 사용 | ~~`padding: 17`~~ |
| 임의 duration 사용 | ~~`duration: 200`~~ |
| 임의 zIndex 사용 | ~~`zIndex: 999`~~ |
| 매직넘버 브레이크포인트 | ~~`width > 768`~~ |
| 하드코딩 opacity | ~~`opacity: 0.5`~~ |
| palette 직접 import | ~~`import { palette } from "../styles/tokens/palette"`~~ |
| foundation/base 직접 import | ~~`import { baseFoundation } ...`~~ |
| 정의되지 않은 variant 사용 | ~~`variant="custom"`~~ |
| 테마 외부에서 density/radius 임의 해석 | ~~`if (theme.name === "brand") { ... }`~~ |

### Import 규칙

```ts
// ✅ 올바른 import
import { StyleSheet } from "../styles/unistyles";
import { resolveResponsive } from "../styles/utils/responsive";

// ❌ 잘못된 import (내부용)
import { palette } from "../styles/tokens/palette";
import { baseFoundation } from "../styles/tokens/foundation.base";
```

---

## 부록: 파일 체크리스트

디자인 시스템 적용 시 아래 파일들이 모두 있는지 확인한다.

### 필수 파일

- [ ] `styles/tokens/palette.ts` - Raw 색상 정의
- [ ] `styles/tokens/responsive.ts` - 반응형 타입 정의
- [ ] `styles/tokens/foundation.base.ts` - 기본 토큰 (spacing, radii, typography 등)
- [ ] `styles/tokens/foundation.ts` - createFoundation 함수
- [ ] `styles/tokens/index.ts` - tokens export
- [ ] `styles/themes/theme.contract.ts` - ThemeContract 타입
- [ ] `styles/themes/light.ts` - 라이트 테마
- [ ] `styles/themes/dark.ts` - 다크 테마
- [ ] `styles/themes/index.ts` - themes export
- [ ] `styles/utils/responsive.ts` - resolveResponsive 유틸
- [ ] `styles/unistyles.ts` - Unistyles 설정
- [ ] `styles/unistyles.d.ts` - 타입 확장
- [ ] `styles/index.ts` - 통합 export
- [ ] `app/_layout.tsx`에서 `import "../styles/unistyles"` 호출

### 선택 파일

- [ ] `styles/themes/brand.ts` - 브랜드/커스텀 테마

### 삭제 대상 (마이그레이션 시)

- [ ] `packages/design-system/` - 삭제
- [ ] `apps/native/design-system/` - 삭제 (styles/로 대체)
- [ ] `apps/native/theme/` - 삭제 (styles/themes/로 대체)

---

## 참고 자료

- [Unistyles 3.0 공식 문서](https://www.unistyl.es/v3/)
- [Unistyles GitHub](https://github.com/jpudysz/react-native-unistyles)
- [npm: react-native-unistyles](https://www.npmjs.com/package/react-native-unistyles)
