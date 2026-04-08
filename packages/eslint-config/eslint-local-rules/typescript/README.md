# typescript ESLint Local Rules

TypeScript 타입 컨벤션, 컴포넌트 props 네이밍 및 구조에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [enforce-props-naming-convention](#enforce-props-naming-convention) | 컴포넌트 props 네이밍 컨벤션을 강제한다 |
| [require-props-interface](#require-props-interface) | 컴포넌트 props 타입은 인라인이 아닌 별도 Props 타입/인터페이스 사용을 강제한다 |

---

## enforce-props-naming-convention

### 개요

`*Props`로 끝나는 타입 또는 인터페이스에서 각 속성의 타입에 따라 네이밍 컨벤션을 강제합니다.

| 속성 타입 | 요구 prefix | 예시 |
|-----------|-------------|------|
| 함수 타입 (`() => void` 등) | `on*` | `onPress`, `onChangeText` |
| boolean 타입 | `is*`, `has*`, `can*`, `should*` | `isLoading`, `hasError` |
| `ReactNode`를 반환하는 함수 | `render*` | `renderItem`, `renderHeader` |

### Correct

```ts
type ButtonProps = {
  onPress: () => void;          // ✅ 함수 → on*
  isDisabled: boolean;          // ✅ boolean → is*
  hasIcon: boolean;             // ✅ boolean → has*
  renderIcon: () => ReactNode;  // ✅ ReactNode 반환 → render*
  label: string;                // ✅ 일반 타입은 자유
};
```

### Incorrect

```ts
type ButtonProps = {
  handlePress: () => void;
  // Error: 함수 타입 props는 on* 으로 시작해야 합니다. (예: onPress)

  loading: boolean;
  // Error: boolean 타입 props는 is*, has*, can*, should* 로 시작해야 합니다. (예: isLoading)

  iconRenderer: () => ReactNode;
  // Error: ReactNode를 반환하는 props는 render* 로 시작해야 합니다. (예: renderItem)
};
```

---

## require-props-interface

### 개요

`src/components/*.tsx`와 `src/features/*/components/*.tsx`에서 컴포넌트 함수의 파라미터 타입을 인라인 타입 리터럴(`{ ... }`)로 작성하는 것을 금지합니다. 별도 `Props` 타입 또는 인터페이스로 분리하세요.

### Correct

```tsx
// ✅ 별도 Props 타입 선언
type Props = {
  name: string;
  age: number;
};

function UserCard({ name, age }: Props) {
  return <Text>{name}</Text>;
}

// ✅ interface 사용도 허용
interface UserCardProps {
  name: string;
}

function UserCard({ name }: UserCardProps) { ... }
```

### Incorrect

```tsx
// ❌ 인라인 타입 리터럴 사용
function UserCard({ name, age }: { name: string; age: number }) {
  // Error
  return <Text>{name}</Text>;
}
// Error: props 타입은 인라인으로 정의하지 말고 별도 Props 타입/인터페이스로 분리하세요.
// (예: type Props = { ... })
```
