# react ESLint Local Rules

React 컴포넌트 구조, 레이어 아키텍처, 스타일 컨벤션, 상태 관리 등에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [api-error-handling](#api-error-handling) | API 레이어 에러 처리 패턴을 강제한다 |
| [api-layer-access-control](#api-layer-access-control) | API 호출 레이어 접근을 계층별로 제한하는 규칙 모음 |
| [async-defer-await](#async-defer-await) | 불필요한 `await`를 조건 검사보다 먼저 수행하는 패턴을 금지한다 |
| [async-parallel](#async-parallel) | 독립적인 async 작업의 순차 `await`를 금지하고 `Promise.all`을 유도한다 |
| [enforce-component-member-order](#enforce-component-member-order) | 컴포넌트 내부 선언 순서를 강제한다 |
| [no-api-call-outside-allowed-layers](#no-api-call-outside-allowed-layers) | API 호출을 허용된 레이어에서만 사용하도록 강제한다 |
| [no-array-index-key-in-jsx](#no-array-index-key-in-jsx) | JSX 리스트 렌더링에서 배열 인덱스를 `key`로 사용하는 패턴을 금지한다 |
| [no-business-logic-in-component](#no-business-logic-in-component) | `src/components/`에서 비즈니스 로직 사용을 금지한다 |
| [no-cross-feature-import](#no-cross-feature-import) | feature 간 직접 import를 금지한다 |
| [no-direct-external-ui-import](#no-direct-external-ui-import) | 외부 UI 라이브러리를 직접 import하는 것을 금지한다 |
| [no-global-init-in-effect](#no-global-init-in-effect) | 빈 deps `useEffect` 안에서 전역 초기화 코드를 금지한다 |
| [no-inline-component](#no-inline-component) | 컴포넌트 함수 내부에서 다른 컴포넌트를 선언하는 패턴을 금지한다 |
| [no-inline-default-in-memo](#no-inline-default-in-memo) | `React.memo` 컴포넌트 파라미터에 인라인 참조형 기본값 사용을 금지한다 |
| [no-inline-style-except-design](#no-inline-style-except-design) | JSX `style` prop에 인라인 객체 리터럴 사용을 금지한다 |
| [no-multiple-components-in-file](#no-multiple-components-in-file) | 하나의 파일에서 export 되는 컴포넌트를 1개로 제한한다 |
| [no-raw-color-in-style](#no-raw-color-in-style) | 스타일에 색상 리터럴 직접 사용을 금지한다 |
| [no-raw-size-in-style](#no-raw-size-in-style) | 스타일에 사이즈/간격 숫자 리터럴 직접 사용을 금지한다 |
| [no-raw-style-value-outside-ui](#no-raw-style-value-outside-ui) | `src/components/ui` 외부에서 스타일 prop에 색상/사이즈 리터럴 사용을 금지한다 |
| [no-render-mutation](#no-render-mutation) | 렌더 중 props나 외부 상태를 직접 변경하는 코드를 금지한다 |
| [no-router-import-outside-entry](#no-router-import-outside-entry) | expo-router 라우팅 API import를 허용된 파일로 제한한다 |
| [no-store-import-in-components](#no-store-import-in-components) | `src/components/` 또는 `src/app/`에서 store 직접 import를 금지한다 |
| [no-tamagui-token-string-outside-ui](#no-tamagui-token-string-outside-ui) | `src/components/ui` 외부에서 Tamagui 토큰 문자열(`$...`) 사용을 금지한다 |
| [no-unstable-value-in-render](#no-unstable-value-in-render) | 렌더 본문에서 `Date.now()`, `Math.random()`, `new Date()` 등 불안정 값 생성을 금지한다 |
| [no-zustand-full-selector](#no-zustand-full-selector) | `(s) => s` 형태의 Zustand 전체 selector 사용을 금지한다 |
| [no-zustand-without-selector](#no-zustand-without-selector) | Zustand store를 selector 없이 호출하는 것을 금지한다 |
| [rendering-hoist-jsx](#rendering-hoist-jsx) | 정적 JSX를 컴포넌트 내부에서 반복 생성하는 패턴을 금지한다 |
| [require-passive-event-listener](#require-passive-event-listener) | scroll/touch/wheel 이벤트 리스너에 `passive` 옵션을 강제한다 |
| [require-tanstack-query-for-api](#require-tanstack-query-for-api) | API 호출은 `useQuery`/`useMutation`으로 감싸도록 강제한다 |
| [strict-boolean-jsx-expression](#strict-boolean-jsx-expression) | JSX에서 `&&` 조건 렌더 대신 명시적 boolean 표현을 강제한다 |
| [ui-layer-access-control](#ui-layer-access-control) | `src/components/ui` 레이어에 허용되지 않는 import와 로직 패턴을 금지하는 규칙 모음 |

---

## api-error-handling

### 개요

API 레이어와 훅 레이어의 에러 처리 패턴을 4가지 규칙으로 강제합니다.

| 규칙 ID | 적용 경로 | 내용 |
|---------|-----------|------|
| `require-mutation-error-handler` | `src/hooks/`, `src/features/*/hooks/` | `useMutation`에 반드시 `onError` 핸들러 명시 |
| `require-try-catch-in-api-layer` | `src/features/*/api/`, `src/services/` | async 함수는 반드시 `try-catch`로 감싸기 |
| `require-api-error-throw` | `src/features/*/api/`, `src/services/` | `catch` 블록에서 반드시 `new ApiError(error)` throw |
| `no-http-status-in-api-layer` | API 레이어 (`api-client.ts` 제외) | 401, 403 등 공통 HTTP 상태코드를 직접 처리 금지 |

### Correct

```ts
// ✅ useMutation에 onError 핸들러
useMutation({
  mutationFn: createUser,
  onError: (error) => toast.error(error.message),
});

// ✅ API 레이어 — try-catch + ApiError throw
async function fetchUser(id: string) {
  try {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  } catch (error) {
    throw new ApiError(error);
  }
}
```

### Incorrect

```ts
// ❌ onError 없는 useMutation
useMutation({ mutationFn: createUser });
// Error: useMutation 에는 반드시 onError 핸들러를 명시하세요.

// ❌ try-catch 없는 async API 함수
async function fetchUser(id: string) {
  const res = await apiClient.get(`/users/${id}`); // Error
  return res.data;
}

// ❌ API 레이어에서 공통 HTTP 상태코드 직접 처리
if (error.status === 401) { ... }
// Error: api 레이어에서 공통 HTTP 상태코드를 직접 처리하지 마세요. interceptor에서 처리하세요.
```

---

## async-defer-await

### 개요

비싼 async 호출을 조건 검사보다 먼저 수행하는 패턴을 금지합니다. 조건을 먼저 확인하여 불필요한 API 호출을 막으세요.

### Correct

```ts
// ✅ 조건 검사 후 await
async function handleSubmit(data) {
  if (!data.isValid) return;
  const result = await expensiveApiCall(data);
}
```

### Incorrect

```ts
// ❌ await 후 조건 검사
async function handleSubmit(data) {
  const result = await expensiveApiCall(data); // Error
  if (!data.isValid) return;
}
// Error: 비싼 async 호출 전에 조건 검사를 먼저 하세요.
```

---

## async-parallel

### 개요

서로 의존하지 않는 독립적인 async 작업을 순차적으로 `await`하는 패턴을 금지합니다. `Promise.all`로 병렬 처리하세요.

### Correct

```ts
// ✅ Promise.all로 병렬 처리
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

### Incorrect

```ts
// ❌ 독립적인 작업을 순차 실행
const user = await getUser(id);   // Error
const posts = await getPosts(id); // Error
// Error: 독립적인 async 작업은 Promise.all로 병렬 처리하세요.
```

---

## enforce-component-member-order

### 개요

React 컴포넌트 내부의 선언 순서를 다음과 같이 강제합니다.

1. Props 구조분해
2. `useState`, `useReducer`
3. `useRef`
4. `useContext`, 커스텀 훅 (`use*`)
5. `useMemo`, `useCallback`
6. `useEffect`, `useLayoutEffect`
7. 이벤트 핸들러 (`handle*`)
8. 파생 변수
9. `return`

### Correct

```tsx
function UserProfile({ userId }: Props) {
  // 1. useState
  const [isOpen, setIsOpen] = useState(false);
  // 2. 커스텀 훅
  const { user } = useUser(userId);
  // 3. useEffect
  useEffect(() => { ... }, []);
  // 4. 핸들러
  const handlePress = () => { ... };
  // 5. return
  return <View />;
}
```

### Incorrect

```tsx
function UserProfile({ userId }: Props) {
  const handlePress = () => { ... }; // ❌ 핸들러가 hooks보다 먼저
  const [isOpen, setIsOpen] = useState(false);
  // Error: 컴포넌트 내부 선언 순서를 지켜주세요: hooks → 핸들러 → return
}
```

---

## no-api-call-outside-allowed-layers

### 개요

`fetch`, `axios` 등 API 호출은 `src/services/` 또는 `src/features/**/api/`에서만 허용합니다.

### Correct

```ts
// ✅ src/services/ 또는 src/features/*/api/ 에서 호출
// src/services/user.api.ts
const res = await fetch('/api/users');

// src/features/auth/api/auth.api.ts
const res = await axios.post('/auth/login', data);
```

### Incorrect

```ts
// ❌ 컴포넌트에서 직접 API 호출
// src/components/user-card.tsx
const res = await fetch('/api/users');
// Error: API 호출은 src/services/ 또는 src/features/**/api/ 에서만 허용됩니다.

// ❌ 훅에서 직접 fetch 호출
// src/hooks/useUser.ts
const data = await axios.get('/users');
// Error: API 호출은 허용된 레이어에서만 가능합니다.
```

---

## no-business-logic-in-component

### 개요

`src/components/` 디렉토리의 컴포넌트에서 비동기 로직, 복잡한 데이터 변환, 깊은 제어문 중첩을 금지합니다. 비즈니스 로직은 훅 또는 서비스 레이어로 위임하세요.

| 금지 패턴 | 내용 |
|-----------|------|
| `no-async-in-component` | async/await, fetch, axios 직접 사용 금지 |
| `no-data-transform-in-component` | 배열 메서드 체이닝 2단계 이상 금지 |
| `no-deep-logic-in-component` | if/for/while/switch 중첩 3단계 이상 금지 |

### Correct

```tsx
// ✅ 훅으로 로직 위임
function UserCard({ userId }: Props) {
  const { user, isLoading } = useUser(userId); // 훅에서 처리
  return <Text>{user?.name}</Text>;
}
```

### Incorrect

```tsx
// ❌ 컴포넌트에서 직접 fetch
async function UserCard({ userId }: Props) {
  const res = await fetch(`/api/users/${userId}`); // Error
  return <Text>{res.name}</Text>;
}

// ❌ 체이닝 2단계 이상
function List({ items }: Props) {
  const result = items.filter(x => x.active).map(x => x.name); // Error
  return <View />;
}
```

---

## no-cross-feature-import

### 개요

`src/features/` 내의 feature 간 직접 import를 금지합니다. 공통 레이어(`components`, `hooks`, `utils` 등)를 통해 접근하세요.

### Correct

```ts
// ✅ 같은 feature 내부 참조
// src/features/auth/hooks/useAuth.ts
import { authApi } from '../api/auth.api';

// ✅ 공통 레이어를 통한 접근
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';
```

### Incorrect

```ts
// ❌ 다른 feature 내부를 직접 import
// src/features/payment/hooks/usePayment.ts
import { useAuth } from '@/features/auth/hooks/useAuth';
// Error: 다른 feature 내부를 직접 import하지 마세요. 공통 레이어를 통해 접근하세요.
```

---

## no-direct-external-ui-import

### 개요

`src/components/ui/` 외부에서 `tamagui`, `@tamagui/*` 등 외부 UI 라이브러리를 직접 import하는 것을 금지합니다. `src/components/ui/`의 래핑 컴포넌트를 사용하세요.

### Correct

```tsx
// ✅ ui 래핑 컴포넌트 사용
import { Button } from '@/components/ui/button';

// ✅ src/components/ui/ 내부에서는 직접 import 허용
// src/components/ui/button.tsx
import { Button } from 'tamagui';
```

### Incorrect

```tsx
// ❌ feature 컴포넌트에서 tamagui 직접 import
// src/features/auth/components/login-form.tsx
import { Stack, Text } from 'tamagui';
// Error: 외부 UI 라이브러리를 직접 import하지 마세요. src/components/ui/ 의 래핑 컴포넌트를 사용하세요.
```

---

## no-global-init-in-effect

### 개요

빈 의존성 배열(`[]`)을 가진 `useEffect` 안에서 `init*`, `setup*`, `initialize*`, `configure*` 로 시작하는 전역 초기화 함수를 호출하는 것을 금지합니다. StrictMode에서 두 번 실행됩니다.

### Correct

```ts
// ✅ 모듈 레벨에서 초기화
initAnalytics();

// ✅ 비동기 초기화는 허용 (await 포함)
useEffect(() => {
  setupPushNotification().then(...);
}, []);
```

### Incorrect

```ts
// ❌ 빈 deps useEffect 안에서 전역 초기화
useEffect(() => {
  initAnalytics(); // Error
}, []);
// Error: 빈 deps useEffect 안에서 전역 초기화를 하지 마세요. StrictMode에서 두 번 실행됩니다.
```

---

## no-inline-component

### 개요

컴포넌트 함수 내부에서 다른 컴포넌트를 선언하는 패턴을 금지합니다. 렌더마다 컴포넌트가 재정의되어 리마운트가 발생합니다.

### Correct

```tsx
// ✅ 컴포넌트 밖에 선언
const ListItem = ({ item }: { item: Item }) => <Text>{item.name}</Text>;

function List({ items }: Props) {
  return items.map(item => <ListItem key={item.id} item={item} />);
}
```

### Incorrect

```tsx
// ❌ 컴포넌트 안에서 컴포넌트 선언
function List({ items }: Props) {
  const ListItem = ({ item }) => <Text>{item.name}</Text>; // Error
  return items.map(item => <ListItem key={item.id} item={item} />);
}
// Error: 컴포넌트 안에서 다른 컴포넌트를 선언하지 마세요. 렌더마다 재정의되어 리마운트가 발생합니다.
```

---

## no-inline-default-in-memo

### 개요

`React.memo`로 감싼 컴포넌트의 파라미터에서 함수/객체/배열을 인라인 기본값으로 사용하는 것을 금지합니다. 렌더마다 새 참조가 생성되어 memo가 무의미해집니다.

### Correct

```tsx
// ✅ 모듈 레벨 상수로 분리
const NOOP = () => {};
const EMPTY_ARRAY: string[] = [];

const MyComp = React.memo(({ onPress = NOOP, items = EMPTY_ARRAY }: Props) => {
  return <View />;
});
```

### Incorrect

```tsx
// ❌ 인라인 함수/배열 기본값
const MyComp = React.memo(({ onPress = () => {}, items = [] }: Props) => {
  // Error: 인라인 함수/객체/배열 기본값
  return <View />;
});
// Error: React.memo 컴포넌트의 파라미터에 인라인 함수/객체/배열 기본값을 사용하지 마세요.
```

---

## no-inline-style-except-design

### 개요

JSX `style` prop에 인라인 객체 리터럴(`style={{ ... }}`)을 직접 사용하는 것을 금지합니다. `src/components/ui/` 내부에서는 Tamagui token prop을 사용하고, 그 외 레이어에서는 theme/token 값을 props로 전달하세요. (`src/theme/`, `src/components/ui/`는 예외)

### Correct

```tsx
// ✅ Tamagui 토큰 prop 방식
<Stack padding="$4" backgroundColor="$background" />

// ✅ StyleSheet.create() 사용
const styles = StyleSheet.create({ container: { flex: 1 } });
<View style={styles.container} />
```

### Incorrect

```tsx
// ❌ 인라인 스타일 객체
<View style={{ padding: 16, backgroundColor: '#fff' }} />
// Error: 인라인 스타일 객체를 직접 사용하지 마세요. Tamagui 토큰 prop 방식을 사용하세요.
```

---

## no-multiple-components-in-file

### 개요

`src/components/*.tsx`와 `src/features/*/components/*.tsx`에서 export되는 React 컴포넌트는 1개만 허용합니다.

### Correct

```tsx
// ✅ 파일당 컴포넌트 1개만 export
// src/components/user-card.tsx
export function UserCard({ user }: Props) { ... }
```

### Incorrect

```tsx
// ❌ 2개 이상 export
// src/components/user-card.tsx
export function UserCard({ user }: Props) { ... }
export function UserAvatar({ user }: Props) { ... } // Error
// Error: 하나의 파일에서 export 되는 컴포넌트는 1개만 허용됩니다. 파일을 분리하세요.
```

---

## no-raw-color-in-style

### 개요

`StyleSheet.create()` 또는 `style` prop에서 색상 리터럴을 직접 사용하는 것을 금지합니다. `src/components/ui/` 내부에서는 Tamagui token prop을 사용하고, 그 외 레이어에서는 `src/theme/`의 theme/token 값을 props로 전달하세요. (`src/theme/`, `src/components/ui/`는 예외)

감지 패턴: HEX (`#fff`, `#ffffff`), `rgb()`, `rgba()`, `hsl()`, `hsla()`, CSS color keyword (`red`, `blue` 등)

### Correct

```tsx
// ✅ 테마 토큰 사용
import { colors } from '@/theme/colors';
<View style={{ backgroundColor: colors.primary }} />

// ✅ Tamagui 토큰
<Stack backgroundColor="$background" />
```

### Incorrect

```tsx
// ❌ 색상 리터럴 직접 사용
<View style={{ backgroundColor: '#FF5733' }} />
// Error: 색상 리터럴을 직접 사용하지 마세요. src/theme/ 의 토큰을 사용하세요.

const styles = StyleSheet.create({
  box: { color: 'red' }, // Error
});
```

---

## no-raw-size-in-style

### 개요

`StyleSheet.create()` 또는 `style` prop에서 사이즈/간격 관련 속성에 숫자 리터럴을 직접 사용하는 것을 금지합니다. (`0`은 허용)

감지 속성: `fontSize`, `lineHeight`, `letterSpacing`, `width`, `height`, `padding*`, `margin*`, `borderRadius`, `borderWidth`, `gap`

### Correct

```tsx
// ✅ 테마 토큰 사용
import { spacing } from '@/theme/spacing';
<View style={{ padding: spacing.md }} />

// ✅ 0은 허용
<View style={{ margin: 0 }} />
```

### Incorrect

```tsx
// ❌ 숫자 리터럴 직접 사용
<View style={{ padding: 16, fontSize: 14 }} />
// Error: 사이즈 리터럴을 직접 사용하지 마세요. src/theme/ 의 토큰을 사용하세요.
```

---

## no-render-mutation

### 개요

React 렌더 중 props나 외부 상태를 직접 변경하는 코드를 금지합니다. 복사본을 만들어서 사용하세요.

금지 패턴:
- `props.x = value` (prop 멤버에 직접 할당)
- `props.arr.push()`, `.pop()`, `.splice()`, `.sort()`, `.reverse()` 등 배열 변경 메서드
- 외부 변수에 대한 `++`, `--` 연산

### Correct

```tsx
// ✅ 복사본을 만들어 사용
const sorted = [...items].sort(compare);
```

### Incorrect

```tsx
// ❌ props 직접 변경
function Comp({ items }: Props) {
  items.sort(); // Error: 원본 배열 변경
  return <View />;
}
// Error: 렌더 중에 props나 외부 상태를 직접 변경하지 마세요. 복사본을 만들어서 사용하세요.
```

---

## no-store-import-in-components

### 개요

`src/components/**` 또는 `src/app/**`에서 `src/store/`를 직접 import하는 것을 금지합니다. `src/hooks/`를 통해 접근하세요.

### Correct

```tsx
// ✅ hooks를 통해 store 접근
import { useAuthStore } from '@/hooks/useAuthStore';
```

### Incorrect

```tsx
// ❌ components에서 store 직접 import
// src/components/user-card.tsx
import { useAuthStore } from '@/store/auth.store';
// Error: components 또는 app에서 store를 직접 import하지 마세요. src/hooks/ 를 통해 접근하세요.
```

---

## no-zustand-full-selector

### 개요

Zustand store를 `(s) => s` 형태로 전체 상태를 반환하는 selector를 금지합니다. 전체 구독과 동일하여 불필요한 리렌더가 발생합니다.

### Correct

```ts
// ✅ 필요한 필드만 선택
const user = useAuthStore((s) => s.user);
const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
```

### Incorrect

```ts
// ❌ 전체 상태 반환 selector
const store = useAuthStore((s) => s);
// Error: (s) => s 형태의 전체 selector는 사용하지 마세요. 필요한 필드만 선택하세요.
```

---

## no-zustand-without-selector

### 개요

Zustand store를 selector 없이 호출하는 것을 금지합니다. 함수 selector를 반드시 전달하세요.

### Correct

```ts
// ✅ selector 사용
const user = useAuthStore((s) => s.user);
```

### Incorrect

```ts
// ❌ selector 없이 호출
const store = useAuthStore();
// Error: Zustand store는 반드시 selector를 사용해서 호출하세요. 전체 store 구독은 불필요한 리렌더를 발생시킵니다.
```

---

## rendering-hoist-jsx

### 개요

컴포넌트 내부에서 매 렌더마다 새로 생성되는 정적 JSX를 감지하여, 컴포넌트 밖 상수로 분리하도록 유도합니다.

### Correct

```tsx
// ✅ 컴포넌트 밖 상수로 선언
const EMPTY_STATE = <View><Text>데이터가 없습니다.</Text></View>;

function MyList({ items }: Props) {
  if (!items.length) return EMPTY_STATE;
  return <FlashList data={items} />;
}
```

### Incorrect

```tsx
// ❌ 렌더마다 새 element 생성
function MyList({ items }: Props) {
  const emptyState = <View><Text>데이터가 없습니다.</Text></View>; // Error
  if (!items.length) return emptyState;
  return <FlashList data={items} />;
}
// Error: 정적 JSX는 컴포넌트 밖 상수로 분리하세요.
```

---

## require-passive-event-listener

### 개요

`scroll`, `touchstart`, `touchmove`, `touchend`, `touchcancel`, `wheel`, `mousewheel` 이벤트 리스너에 `{ passive: true }` 옵션을 강제합니다.

### Correct

```ts
// ✅ passive 옵션 추가
window.addEventListener('scroll', handleScroll, { passive: true });
element.addEventListener('touchstart', handleTouch, { passive: true });
```

### Incorrect

```ts
// ❌ passive 옵션 없음
window.addEventListener('scroll', handleScroll);
// Error: scroll/touch/wheel 이벤트 리스너에는 { passive: true }를 추가하세요.

window.addEventListener('touchstart', handleTouch, { capture: true });
// Error: 스크롤 성능에 직접 영향을 줍니다.
```

---

## require-tanstack-query-for-api

### 개요

`src/hooks/` 및 `src/features/**/hooks/`에서 API 함수를 `useQuery` / `useMutation`으로 감싸지 않고 직접 `await`하거나 `.then()`으로 호출하는 것을 금지합니다.

### Correct

```ts
// ✅ useQuery로 감싸기
function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getUser(id),
  });
}

// ✅ useMutation으로 감싸기
function useCreateUser() {
  return useMutation({ mutationFn: userApi.createUser });
}
```

### Incorrect

```ts
// ❌ 훅에서 직접 await 호출
async function useUser(id: string) {
  const user = await userApi.getUser(id); // Error
  return user;
}
// Error: api 호출은 반드시 useQuery 또는 useMutation 으로 감싸서 사용하세요.

// ❌ useEffect 안에서 API 직접 호출
useEffect(() => {
  userApi.getUser(id).then(setUser); // Error
}, [id]);
```

---

## api-layer-access-control

### 개요

API 호출 레이어 접근 권한을 계층별로 제한하는 규칙 모음입니다. API 호출은 `src/features/**/hooks/`에서만 허용되며, store, 전역 hooks, store/common 등 다른 레이어에서는 직접 호출할 수 없습니다.

| 규칙 ID | 적용 경로 | 내용 |
|---------|-----------|------|
| `no-api-in-store` | `src/store/common/`, `src/store/features/` | store에서 API 직접 호출 금지 |
| `no-api-in-store-common` | `src/store/common/` | store/common에서 API 직접 호출 금지 |
| `no-api-in-hooks` | `src/hooks/` (전역) | 전역 hooks에서 API 직접 호출 금지 |
| `no-store-features-in-hooks` | `src/hooks/` (전역) | 전역 hooks에서 `store/features` 직접 import 금지 |
| `no-cross-feature-api-import` | `src/features/**/hooks/` | 다른 feature의 api 직접 import 금지 |
| `no-services-direct-import-in-feature-hooks` | `src/features/**/hooks/` | feature hooks에서 `src/services/` 직접 import 금지 |

### Correct

```ts
// ✅ feature hooks에서 자신의 api 호출
// src/features/auth/hooks/useAuth.ts
import { authApi } from '../api/auth.api';
export function useAuth() {
  return useMutation({ mutationFn: authApi.login });
}

// ✅ 전역 hooks는 store/common만 참조
// src/hooks/useTheme.ts
import { useThemeStore } from '@/store/common/theme.store';
```

### Incorrect

```ts
// ❌ store에서 API 직접 호출
// src/store/features/user.store.ts
import { fetch } from 'node-fetch';
const data = await fetch('/api/users');
// Error: store에서는 API를 호출할 수 없습니다. API 호출은 src/features/**/hooks/ 에서만 허용됩니다.

// ❌ 전역 hooks에서 API 직접 호출
// src/hooks/useUser.ts
const res = await axios.get('/api/users');
// Error: 전역 hooks(src/hooks/)에서는 API를 직접 호출할 수 없습니다.

// ❌ feature hooks에서 다른 feature의 api import
// src/features/payment/hooks/usePayment.ts
import { authApi } from '@/features/auth/api/auth.api';
// Error: 다른 feature의 api를 직접 호출하지 마세요. 해당 feature의 hooks를 통해 접근하세요.

// ❌ feature hooks에서 services 직접 import
// src/features/auth/hooks/useAuth.ts
import { userService } from '@/services/user.api';
// Error: src/features/**/hooks/ 에서 src/services/ 를 직접 import하지 마세요. src/hooks/ 를 통해 접근하세요.

// ❌ 전역 hooks에서 store/features import
// src/hooks/useCart.ts
import { useCartStore } from '@/store/features/cart.store';
// Error: 전역 hooks(src/hooks/)에서는 src/store/features/ 를 직접 import할 수 없습니다.
```

---

## no-array-index-key-in-jsx

### 개요

`.map()` 콜백의 두 번째 파라미터(인덱스)를 JSX `key` prop에 사용하는 패턴을 금지합니다. 아이템이 추가/삭제/재정렬될 때 key가 변경되어 불필요한 리마운트와 상태 버그가 발생합니다.

### Correct

```tsx
// ✅ 아이템 고유 id 사용
{items.map((item) => (
  <Card key={item.id} item={item} />
))}
```

### Incorrect

```tsx
// ❌ 인덱스를 key로 사용
{items.map((item, index) => (
  <Card key={index} item={item} />
))}
// Error: 리스트 렌더링에서 배열 index를 key로 사용하지 마세요. 안정적인 식별자를 사용하세요.

// ❌ 인덱스를 가공해서 key로 사용
{items.map((item, i) => (
  <Card key={`item-${i}`} item={item} />
))}
// Error: 리스트 렌더링에서 배열 index를 key로 사용하지 마세요.
```

---

## no-raw-style-value-outside-ui

### 개요

`src/components/ui/` 외부에서 JSX 스타일 prop에 색상 리터럴 또는 사이즈 숫자 리터럴을 직접 전달하는 것을 금지합니다. `src/theme/`에서 import한 토큰 변수를 사용하세요. (`src/components/ui/`, `src/theme/`는 예외)

감지 대상:
- 색상 prop: `color`, `backgroundColor`, `borderColor`, `shadowColor`, `placeholderTextColor`, `tintColor`
- 사이즈 prop: `padding*`, `margin*`, `width`, `height`, `fontSize`, `lineHeight`, `borderRadius`, `borderWidth`, `gap`

### Correct

```tsx
// ✅ theme 토큰 사용
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

<Text color={colors.primary} fontSize={spacing.md} />
<Stack padding={spacing.lg} backgroundColor={colors.background} />
```

### Incorrect

```tsx
// ❌ 색상 리터럴 직접 전달
<Text color="#FF0000" />
// Error: 색상 리터럴을 직접 사용하지 마세요. src/theme/ 에서 import한 토큰을 사용하세요. (예: colors.warning)

// ❌ 사이즈 숫자 리터럴 직접 전달
<Stack padding={16} />
// Error: 사이즈 리터럴을 직접 사용하지 마세요. src/theme/ 에서 import한 토큰을 사용하세요. (예: spacing.md)
```

---

## no-router-import-outside-entry

### 개요

`expo-router`의 라우팅 API(`router`, `useRouter`, `Link`, `Redirect`, `useLocalSearchParams`, `useSegments`)를 `src/app/**` 또는 feature entry/container 파일 외부에서 import하는 것을 금지합니다.

허용 경로:
- `src/app/**` (Expo Router 라우트 파일)
- `src/features/[name]/*.tsx` (feature 루트 직속 파일)
- `src/features/[name]/**/*screen.tsx`, `*route.tsx`, `*entry.tsx`, `*container.tsx`

### Correct

```tsx
// ✅ src/app/ 에서 사용
// src/app/index.tsx
import { router } from 'expo-router';
router.push('/home');

// ✅ feature entry 파일에서 사용
// src/features/auth/AuthScreen.tsx
import { useRouter } from 'expo-router';

// ✅ feature container 파일에서 사용
// src/features/payment/PaymentContainer.tsx
import { useLocalSearchParams } from 'expo-router';
```

### Incorrect

```tsx
// ❌ feature hooks에서 router import
// src/features/auth/hooks/useAuthForm.ts
import { useRouter } from 'expo-router';
// Error: expo-router 라우팅 API는 src/app/** 또는 feature entry/container 파일에서만 사용하세요.

// ❌ 공통 컴포넌트에서 router import
// src/components/ui/button.tsx
import { router } from 'expo-router';
// Error: expo-router 라우팅 API는 src/app/** 또는 feature entry/container 파일에서만 사용하세요.
```

---

## no-tamagui-token-string-outside-ui

### 개요

`src/components/ui/` 외부에서 JSX 스타일 prop에 Tamagui 토큰 문자열(`$...`)을 직접 하드코딩하는 것을 금지합니다. UI 라이브러리 교체 시 전체 수정이 필요해집니다. `src/theme/`에서 토큰을 정의하고 import해서 사용하세요.

### Correct

```tsx
// ✅ theme에서 import한 변수 사용
import { colors } from '@/theme/colors';
<Text color={colors.primary} />

// ✅ src/components/ui/ 내부에서는 토큰 문자열 허용
// src/components/ui/text.tsx
<Text color="$color" fontSize="$3" />
```

### Incorrect

```tsx
// ❌ feature에서 Tamagui 토큰 문자열 직접 사용
// src/features/home/HomeScreen.tsx
<Text color="$orange8" />
// Error: Tamagui 토큰 문자열('$...')을 직접 사용하지 마세요.
// UI 라이브러리 교체 시 모두 수정해야 하는 위험이 있습니다.
// src/theme/ 에서 토큰을 정의하고 import해서 사용하세요.

<Stack padding="$4" />
// Error: src/theme/ 에서 import한 토큰을 사용하세요. (예: import { colors } from '@/theme/colors')
```

---

## no-unstable-value-in-render

### 개요

React 컴포넌트 렌더 본문에서 `Date.now()`, `Math.random()`, `new Date()`를 직접 호출하는 것을 금지합니다. 매 렌더마다 새로운 값이 생성되어 자식 컴포넌트 불필요한 리렌더, key 불안정, 애니메이션 깜빡임 등을 유발합니다. 이벤트 핸들러나 `useRef`, `useMemo`로 옮기세요.

### Correct

```tsx
// ✅ useRef로 초기값 고정
const id = useRef(Date.now());

// ✅ useMemo로 메모이제이션
const snapshot = useMemo(() => new Date(), [trigger]);

// ✅ 이벤트 핸들러 안에서는 허용
const handlePress = () => {
  const now = Date.now();
  submit(now);
};
```

### Incorrect

```tsx
// ❌ 렌더 본문에서 Date.now() 호출
function ListItem({ item }: Props) {
  const renderedAt = Date.now(); // Error
  return <Text>{item.name}</Text>;
}
// Error: 렌더 본문에서 매번 달라지는 값을 만들지 마세요. useMemo/useRef 또는 이벤트 핸들러로 옮기세요.

// ❌ 렌더 본문에서 Math.random() 호출
function Card({ item }: Props) {
  const color = colors[Math.floor(Math.random() * colors.length)]; // Error
  return <View style={{ backgroundColor: color }} />;
}

// ❌ 렌더 본문에서 new Date() 호출
function Timer() {
  const now = new Date(); // Error
  return <Text>{now.toISOString()}</Text>;
}
```

---

## ui-layer-access-control

### 개요

`src/components/ui/` 레이어에서 허용되지 않는 import 및 로직 패턴을 제한하는 규칙 모음입니다. UI 컴포넌트는 순수한 표현 계층이어야 하며, 비즈니스 로직과 외부 의존성을 가져서는 안 됩니다.

| 규칙 ID | 내용 |
|---------|------|
| `no-feature-import-in-ui` | `features`, `store`, `services` import 금지 |
| `no-async-in-ui` | `async/await`, `fetch`, `axios` 사용 금지 |
| `no-business-logic-in-ui` | 배열 메서드 체이닝 2단계 이상, 제어문 3단계 이상 중첩, `new Date()` 사용 금지 |

### Correct

```tsx
// ✅ hooks와 theme만 참조
// src/components/ui/user-card.tsx
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';

export function UserCard({ name, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Text>{name}</Text>
    </Pressable>
  );
}
```

### Incorrect

```tsx
// ❌ features import
// src/components/ui/button.tsx
import { useAuthStore } from '@/features/auth/store';
// Error: src/components/ui 에서는 features, store, services 를 import할 수 없습니다.

// ❌ 비동기 호출
const data = await fetch('/api/users');
// Error: src/components/ui 에서는 비동기 호출을 할 수 없습니다. 비동기 로직은 src/hooks/ 로 위임하세요.

// ❌ 배열 메서드 체이닝 2단계
const result = items.filter(Boolean).map(String);
// Error: src/components/ui 에서는 비즈니스 로직을 작성할 수 없습니다. 로직은 src/hooks/ 로 위임하세요.
```

---

## strict-boolean-jsx-expression

### 개요

JSX에서 `&&` 조건 렌더를 사용할 때, 좌변이 단순 식별자나 멤버 표현식인 경우를 금지합니다. `0`, `''` 같은 falsy 값이 렌더링될 수 있습니다. 삼항 연산자를 사용하세요.

### Correct

```tsx
// ✅ 삼항 연산자 사용
{count > 0 ? <Badge count={count} /> : null}

// ✅ 명시적 boolean 변환 허용
{!!user && <UserCard user={user} />}
{Boolean(items.length) && <List />}
```

### Incorrect

```tsx
// ❌ 단순 식별자로 && 조건 렌더
{count && <Badge count={count} />}
// Error: 0이 렌더링될 수 있습니다. 삼항 연산자를 사용하세요.

{user.name && <Text>{user.name}</Text>}
// Error: JSX에서 && 조건 렌더를 사용하지 마세요.
```
