# @repo/design-system

크로스 플랫폼 디자인 시스템 (웹 + React Native 통합)

## 📦 구조

```
packages/design-system/
├── src/
│   ├── tokens/                    # 플랫폼 독립적 디자인 토큰 (2-Layer)
│   │   ├── raw/                   # Raw Token Layer (Tailwind 표준)
│   │   │   ├── colors.ts          # 기본 컬러 팔레트 (50-950 스케일)
│   │   │   ├── typography.ts      # 폰트 크기/웨이트/행간
│   │   │   └── spacing.ts         # 간격/반경
│   │   │
│   │   ├── semantic/              # Semantic Token Layer (의미 기반)
│   │   │   ├── colors.ts          # action, content, surface, border, feedback
│   │   │   └── typography.ts      # 7가지 variant (display, hero, title...)
│   │   │
│   │   └── index.ts               # 통합 export
│   │
│   ├── web/                       # 웹 전용 (Tailwind + CVA)
│   │   ├── utils/cn.ts            # className 병합 유틸
│   │   └── variants/              # CVA variants
│   │
│   └── native/                    # React Native 전용 (StyleSheet)
│       └── styles/                # StyleSheet 헬퍼
│
└── index.ts
```

## 🎯 핵심 특징

### ✅ 2-Layer 토큰 아키텍처 (Raw → Semantic)

**Raw Token Layer** - Tailwind 표준 컬러 팔레트
```typescript
// packages/design-system/src/tokens/raw/colors.ts
export const rawColors = {
  gray: { 50: '#f9fafb', ..., 950: '#030712' },
  brand: { 50: '#eff6ff', ..., 950: '#172554' },  // 프로젝트 메인 컬러
  red: { 50: '#fef2f2', ..., 950: '#450a0a' },
  green: { 50: '#f0fdf4', ..., 950: '#052e16' },
  // ...
}
```

**Semantic Token Layer** - 의미 기반 매핑
```typescript
// packages/design-system/src/tokens/semantic/colors.ts
export const actionColors = {
  primary: { light: rawColors.brand[600], dark: rawColors.brand[500] },
  secondary: { light: rawColors.gray[600], dark: rawColors.gray[500] },
  destructive: { light: rawColors.red[600], dark: rawColors.red[500] },
  // ...
}

export const contentColors = {
  heading: { light: rawColors.gray[900], dark: rawColors.gray[50] },
  body: { light: rawColors.gray[700], dark: rawColors.gray[300] },
  // ...
}
```

### ✅ 웹 가이드 기준 컴포넌트

모든 컴포넌트는 웹 디자인 가이드를 기준으로 구현되어 웹/네이티브 간 일관성 유지:

- **Button**: primary, secondary, ghost, outline, danger
- **Input**: outlined, filled, underlined, ghost
- **Typography**: display, hero, title, subtitle, body, caption, label

### ✅ 웹과 네이티브 동일한 API

**웹**:
```tsx
import { Button } from '@repo/design-system/web';

<Button variant="primary" size="md">저장</Button>
```

**네이티브**:
```tsx
import { Button } from '@/components/common/Button';

<Button variant="primary" size="md">저장</Button>
```

## 📚 사용 예시

### React Native 컴포넌트

#### Button
```tsx
import Button from '@/components/common/Button';

// 기본 사용
<Button variant="primary" size="md">저장</Button>

// 아이콘 포함
<Button
  variant="secondary"
  size="sm"
  leftIcon={<Icon name="check" />}
>
  확인
</Button>

// 로딩 상태
<Button loading variant="primary">처리중...</Button>

// 전체 너비
<Button fullWidth variant="danger">삭제</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
- `size`: 'sm' (32px) | 'md' (40px) | 'lg' (48px)
- `leftIcon`, `rightIcon`: React.ReactNode
- `loading`: boolean
- `fullWidth`: boolean

#### Input
```tsx
import Input from '@/components/common/Input';

// 기본 사용
<Input
  placeholder="이름을 입력하세요"
  value={value}
  onChangeText={setValue}
/>

// 에러 상태
<Input
  variant="outlined"
  error
  helperText="필수 항목입니다"
/>

// Label 포함
<Input
  label="이메일"
  placeholder="example@email.com"
/>

// Multiline
<Input
  multiline
  style={{ height: 100 }}
/>
```

**Props:**
- `variant`: 'outlined' | 'filled' | 'underlined' | 'ghost'
- `size`: 'xs' | 'sm' | 'md' | 'lg'
- `error`: boolean
- `success`: boolean
- `fullWidth`: boolean
- `label`: string
- `helperText`: string

#### Typography
```tsx
import Typography from '@/components/common/Typography';

// 7가지 Variant
<Typography variant="display">Display Text (60px)</Typography>
<Typography variant="hero">Hero Text (48px)</Typography>
<Typography variant="title">Title Text (36px)</Typography>
<Typography variant="subtitle">Subtitle Text (24px)</Typography>
<Typography variant="body">Body Text (16px)</Typography>
<Typography variant="caption">Caption Text (14px)</Typography>
<Typography variant="label">Label Text (12px)</Typography>

// Size 오버라이드
<Typography variant="body" size="lg">큰 본문</Typography>
```

**Props:**
- `variant`: 'display' | 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'label'
- `size`: FontSize (옵션 - variant 크기 오버라이드)

### Style Helpers (앱 내부 사용)

#### Button Styles
```tsx
import { createButtonStyle } from '@/design-system';

const buttonStyle = createButtonStyle('primary', 'md', colorScheme);
// Returns: { container: ViewStyle, text: TextStyle }
```

#### Input Styles
```tsx
import { createInputStyle } from '@/design-system';

const inputStyle = createInputStyle('outlined', 'md', colorScheme, { error: true });
// Returns: { container, input, placeholderColor, label, helperText }
```

#### Typography Styles
```tsx
import { createTypographyStyle } from '@/design-system';

const textStyle = createTypographyStyle('body', colorScheme, { size: 'lg' });
// Returns: TextStyle
```

## 🎨 디자인 토큰

### Raw Tokens

#### Colors (Tailwind 표준 50-950 스케일)
```typescript
rawColors.gray[50]    // #f9fafb
rawColors.gray[500]   // #6b7280
rawColors.gray[950]   // #030712

rawColors.brand[50]   // #eff6ff (프로젝트 메인 컬러)
rawColors.brand[600]  // #2563eb
rawColors.brand[950]  // #172554

rawColors.red[600]    // #dc2626 (Error)
rawColors.green[600]  // #16a34a (Success)
rawColors.yellow[600] // #ca8a04 (Warning)
rawColors.blue[600]   // #2563eb (Info)
```

#### Typography
```typescript
// Font Size
typography.fontSize.xs    // 12px
typography.fontSize.base  // 16px
typography.fontSize['6xl'] // 60px

// Font Weight
typography.fontWeight.normal   // '400'
typography.fontWeight.bold     // '700'

// Line Height
typography.lineHeight.tight   // 1.25
typography.lineHeight.normal  // 1.5
```

#### Spacing
```typescript
spacing[0]   // 0
spacing[4]   // 16px
spacing[8]   // 32px

borderRadius.sm   // 2px
borderRadius.md   // 6px
borderRadius.full // 9999px
```

### Semantic Tokens

#### Action Colors (버튼, 링크)
```typescript
actionColors.primary          // Brand 컬러 활용 (저장, 확인, 제출)
actionColors.secondary        // Gray 컬러 (취소, 닫기)
actionColors.destructive      // Red 컬러 (삭제, 제거)
actionColors.ghostHover       // Ghost 버튼 hover 상태
```

#### Content Colors (텍스트)
```typescript
contentColors.heading         // 제목 텍스트
contentColors.body            // 본문 텍스트
contentColors.muted           // 흐린 텍스트
contentColors.link            // 링크 텍스트
contentColors.disabled        // 비활성 텍스트
```

#### Surface Colors (배경)
```typescript
surfaceColors.base            // 기본 배경
surfaceColors.raised          // 카드 배경
surfaceColors.hover           // Hover 배경
surfaceColors.selected        // 선택된 항목 배경
```

#### Border Colors (경계선)
```typescript
borderColors.default          // 기본 보더
borderColors.focus            // Focus 보더
borderColors.error            // 에러 보더
borderColors.divider          // 구분선
```

#### Feedback Colors (피드백/상태)
```typescript
feedbackColors.success        // { bg, border, text, icon }
feedbackColors.error          // { bg, border, text, icon }
feedbackColors.warning        // { bg, border, text, icon }
feedbackColors.info           // { bg, border, text, icon }
```

#### Typography Variants
```typescript
typographyVariants.display    // { fontSize: 60, fontWeight: '700', lineHeight: 1.25 }
typographyVariants.hero       // { fontSize: 48, fontWeight: '700', lineHeight: 1.25 }
typographyVariants.title      // { fontSize: 36, fontWeight: '700', lineHeight: 1.25 }
typographyVariants.subtitle   // { fontSize: 24, fontWeight: '600', lineHeight: 1.375 }
typographyVariants.body       // { fontSize: 16, fontWeight: '400', lineHeight: 1.5 }
typographyVariants.caption    // { fontSize: 14, fontWeight: '400', lineHeight: 1.5 }
typographyVariants.label      // { fontSize: 12, fontWeight: '500', lineHeight: 1.5 }
```

## 🔄 토큰 변경 시

### 브랜드 컬러 변경
프로젝트의 메인 컬러를 변경하려면 `rawColors.brand` 팔레트만 수정:

```typescript
// packages/design-system/src/tokens/raw/colors.ts
export const rawColors = {
  brand: {
    50: '#fef2f2',   // 빨강 계열로 변경
    100: '#fee2e2',
    // ...
    600: '#dc2626',  // Primary 버튼 색상
    // ...
    950: '#450a0a',
  }
}

// 모든 primary 버튼, link 색상이 자동으로 변경됨!
```

### Semantic 토큰 조정
의미 기반 토큰의 매핑만 변경:

```typescript
// packages/design-system/src/tokens/semantic/colors.ts
export const actionColors = {
  // Primary 버튼을 green 계열로 변경
  primary: {
    light: rawColors.green[600],  // 변경
    dark: rawColors.green[500]
  },
  // ...
}
```

## 🚀 마이그레이션 완료

### 제거된 컴포넌트
- ❌ `ThemeTextInput` → ✅ `Input`으로 완전 교체
- ❌ `ThemeText` → ✅ `Typography`로 마이그레이션 권장

### 변경된 Props

#### Button
```tsx
// Before
<Button
  size="small"           // ❌
  variant="plain"        // ❌
  icon={<Icon />}        // ❌
  fontSize="caption"     // ❌
/>

// After
<Button
  size="sm"              // ✅
  variant="ghost"        // ✅
  leftIcon={<Icon />}    // ✅
  // fontSize 제거 (size로 통합)
/>
```

#### Input (구 ThemeTextInput)
```tsx
// Before
<ThemeTextInput
  width={250}
  variant="primary"
  size="medium"
/>

// After
<Input
  style={{ width: 250 }}  // 또는 fullWidth
  variant="outlined"
  size="md"
/>
```

## 📈 개선 효과

- ✅ **2-Layer 토큰 아키텍처**: Raw(기본) → Semantic(의미) 분리로 유연성 향상
- ✅ **웹 가이드 준수**: 웹 디자인 시스템과 100% 일치하는 API
- ✅ **컴포넌트 통일**: ThemeTextInput 제거, Input으로 완전 통합
- ✅ **타입 안정성**: 완전한 TypeScript 지원
- ✅ **확장성**: 새로운 컬러/variant 추가 용이
- ✅ **유지보수성**: 한 곳(raw)에서 기본 컬러 관리, semantic에서 의미 부여

## 🔧 개발 가이드

### 새로운 컬러 추가
1. Raw 토큰에 팔레트 추가 (필요시)
2. Semantic 토큰에 의미 매핑
3. Style helper에서 사용

### 새로운 컴포넌트 추가
1. 웹 가이드 확인
2. Style helper 작성 (`design-system/styles/`)
3. 컴포넌트 구현 (`components/common/`)
4. Props는 웹 가이드와 동일하게 유지

### 브랜드 색상 변경
`packages/design-system/src/tokens/raw/colors.ts`의 `brand` 팔레트만 수정하면 모든 primary 액션 요소에 자동 반영됩니다.
