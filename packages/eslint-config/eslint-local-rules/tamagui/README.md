# tamagui ESLint Local Rules

Tamagui UI 라이브러리 사용 패턴과 디자인 토큰 컨벤션에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [no-direct-external-ui-import](#no-direct-external-ui-import) | `src/components/ui` 외부에서 tamagui 직접 import를 금지한다 |
| [no-raw-tamagui-prop](#no-raw-tamagui-prop) | Tamagui 컴포넌트의 스타일 prop에 리터럴 대신 토큰 사용을 강제한다 |
| [no-stylesheet-create](#no-stylesheet-create) | Tamagui 사용 프로젝트에서 `StyleSheet.create` 사용을 제한한다 |

---

## no-direct-external-ui-import

### 개요

`src/components/ui/` 외부에서 `tamagui`, `@tamagui/*` 패키지를 직접 import하는 것을 금지합니다. 래핑 컴포넌트를 통해 UI 라이브러리 교체 시 수정 범위를 최소화합니다.

### Correct

```tsx
// ✅ src/components/ui/ 내부에서는 허용
// src/components/ui/button.tsx
import { Button } from 'tamagui';

// ✅ 앱 코드에서는 래핑 컴포넌트 사용
import { Button } from '@/components/ui/button';
```

### Incorrect

```tsx
// ❌ src/components/ui/ 외부에서 tamagui 직접 import
// src/features/auth/components/login-form.tsx
import { Stack, Text, Button } from 'tamagui';
// Error: src/components/ui 외부에서는 "tamagui"를 직접 import할 수 없습니다.

import { useTheme } from '@tamagui/core';
// Error: src/components/ui 외부에서는 "@tamagui/core"를 직접 import할 수 없습니다.
```

---

## no-raw-tamagui-prop

### 개요

`src/components/ui/` 내부의 Tamagui 컴포넌트에서 색상 및 사이즈 prop에 리터럴 값 대신 Tamagui 토큰 문자열(`$...`)을 사용하도록 강제합니다.

| prop 종류 | 금지 | 허용 |
|-----------|------|------|
| 색상 prop (`color`, `backgroundColor`, `borderColor` 등) | `'#fff'`, `'red'`, `'rgba(...)` | `'$background'`, `'$color'` |
| 사이즈 prop (`padding`, `margin`, `width`, `height`, `gap` 등) | `16`, `24` | `'$4'`, `'$true'` |

### Correct

```tsx
// ✅ Tamagui 토큰 사용
<Stack padding="$4" backgroundColor="$background">
  <Text color="$color" fontSize="$3">Hello</Text>
</Stack>
```

### Incorrect

```tsx
// ❌ 색상 리터럴 직접 사용
<Stack backgroundColor="#ffffff">
// Error: Tamagui 색상 prop 에 리터럴을 사용하지 마세요. 토큰을 사용하세요. (예: '$background')

// ❌ 사이즈 리터럴 직접 사용
<Stack padding={16}>
// Error: Tamagui 사이즈 prop 에 리터럴을 사용하지 마세요. 토큰을 사용하세요. (예: '$4')
```

---

## no-stylesheet-create

### 개요

Tamagui를 사용하는 프로젝트에서 `StyleSheet.create()` 호출 및 `react-native`에서 `StyleSheet` import를 금지합니다. Tamagui 토큰 prop 방식으로 대체하세요.

### Correct

```tsx
// ✅ Tamagui 토큰 prop 방식
<Stack padding="$4" flex={1} />
<Text color="$color" fontSize="$3" />
```

### Incorrect

```tsx
// ❌ StyleSheet import
import { StyleSheet } from 'react-native';
// Error: StyleSheet.create() 대신 Tamagui 토큰을 사용하세요.

// ❌ StyleSheet.create() 호출
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
// Error: StyleSheet.create() 대신 Tamagui 토큰을 사용하세요. (예: padding='$4', backgroundColor='$background')
```
