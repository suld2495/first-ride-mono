# @repo/design-system

크로스 플랫폼 디자인 시스템 (웹 + React Native 통합)

## 📦 구조

```
packages/design-system/
├── src/
│   ├── tokens/              # 플랫폼 독립적 디자인 토큰
│   │   ├── colors.ts        # 색상 토큰
│   │   ├── typography.ts    # 타이포그래피 토큰
│   │   └── spacing.ts       # 간격 토큰
│   │
│   ├── web/                 # 웹 전용 (Tailwind + CVA)
│   │   ├── utils/cn.ts      # className 병합 유틸
│   │   └── variants/        # CVA variants
│   │
│   └── native/              # React Native 전용 (StyleSheet)
│       └── styles/          # StyleSheet 헬퍼
│
└── index.ts
```

## 🎯 핵심 특징

### ✅ 한 곳에서 토큰 관리 → 모든 플랫폼 동기화

```typescript
// packages/design-system/src/tokens/colors.ts
export const colors = {
  primary: {
    light: '#1e293b',  // 웹과 네이티브 동일!
    dark: '#435d88',
  }
}
```

### ✅ Tailwind 클래스 충돌 해결 (CVA + cn())

```tsx
// ❌ 이전: className이 무시됨
<Button className="text-blue-500">버튼</Button>

// ✅ 현재: className이 올바르게 적용됨!
<Button className="text-blue-500">버튼</Button>
```

### ✅ 웹과 네이티브 동일한 API

**웹**:
```tsx
import { Paragraph } from '@repo/design-system/web';

<Paragraph variant="h1" color="primary">제목</Paragraph>
```

**네이티브**:
```tsx
import { ThemeText } from '@repo/design-system/native';

<ThemeText variant="h1" color="primary">제목</ThemeText>
```

## 📚 사용 예시

### 웹 컴포넌트

```tsx
import {
  cn,
  paragraphVariants,
  buttonVariants,
  inputVariants
} from '@repo/design-system/web';

// Paragraph
<Paragraph
  variant="body"
  color="accent-quest"
  weight="bold"
>
  텍스트
</Paragraph>

// Button
<Button variant="primary" size="large">
  저장
</Button>

// Input
<Input
  variant="primary"
  size="medium"
  error={false}
/>
```

### React Native 컴포넌트

```tsx
import {
  createTextStyle,
  createButtonStyle,
  createInputStyle
} from '@repo/design-system/native';

// ThemeText
<ThemeText variant="body">텍스트</ThemeText>

// Button
<Button variant="primary" size="large" title="저장" />

// TextInput
<ThemeTextInput
  variant="primary"
  size="medium"
  onChangeText={setText}
/>
```

## 🎨 디자인 토큰

### Colors (통합)
```typescript
colors.primary.light      // #1e293b
colors.text.primary.light // #111111
colors.status.error.light // #ff6467
colors.quest.primary      // #1ddeff
```

### Typography (통합)
```typescript
typography.fontSize.base  // 16px
typography.fontWeight.bold // '700'
typography.lineHeight.normal // 1.5
```

### Spacing (통합)
```typescript
spacing[4]  // 16px
borderRadius.md // 6px
```

## 🔄 토큰 변경 시

**한 곳에서만 수정하면 웹 + 네이티브 모두 반영됩니다!**

```typescript
// packages/design-system/src/tokens/colors.ts
export const colors = {
  primary: {
    light: '#FF0000',  // 여기만 변경
    dark: '#00FF00',
  }
}

// 웹 + 네이티브 모든 컴포넌트에 즉시 반영!
```

## 🚀 마이그레이션 가이드

### Before (이전)
```tsx
// 웹: 하드코딩된 Tailwind 클래스
<p className="text-gray-500 dark:text-gray-200">텍스트</p>

// 네이티브: 하드코딩된 색상
<Text style={{ color: '#5c5c5c' }}>텍스트</Text>
```

### After (현재)
```tsx
// 웹: 통합 토큰 사용
<Paragraph color="secondary">텍스트</Paragraph>

// 네이티브: 통합 토큰 사용
<ThemeText color="secondary">텍스트</ThemeText>
```

## 📈 개선 효과

- ✅ **코드 중복 제거**: 15+ 파일의 중복 스타일 제거
- ✅ **일관성**: 웹/네이티브 동일한 디자인
- ✅ **유지보수성**: 한 곳에서 토큰 관리
- ✅ **타입 안정성**: 완전한 TypeScript 지원
- ✅ **Tailwind 클래스 충돌 해결**: cn() + CVA
