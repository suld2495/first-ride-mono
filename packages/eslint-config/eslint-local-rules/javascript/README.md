# javascript ESLint Local Rules

파일 위치에 따른 파일명 컨벤션, 성능 패턴, React 훅 규칙 등 JavaScript/TypeScript 전반에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [enforce-filename-convention](#enforce-filename-convention) | 파일 위치에 따라 파일명 컨벤션을 강제한다 |
| [js-hoist-regexp](#js-hoist-regexp) | 루프 안에서 정규식을 반복 생성하는 패턴을 금지한다 |
| [js-index-maps](#js-index-maps) | 같은 배열에 대한 반복 탐색을 금지하고 Map 인덱싱을 유도한다 |
| [max-file-lines](#max-file-lines) | 파일이 너무 길어지는 것을 방지한다 |
| [no-find-in-loop](#no-find-in-loop) | 루프 안에서 `.find()` / `.findIndex()` 호출을 금지한다 |
| [no-function-call-in-usestate](#no-function-call-in-usestate) | `useState`에 함수 호출 결과를 직접 전달하는 패턴을 금지한다 |
| [no-includes-in-loop](#no-includes-in-loop) | 루프 안에서 배열 `.includes()` 호출을 금지한다 |
| [no-relative-import-outside-feature](#no-relative-import-outside-feature) | feature 외부 모듈 참조 시 상대경로 대신 절대경로(`@/`) 사용을 강제한다 |
| [no-setstate-in-effect-for-derived](#no-setstate-in-effect-for-derived) | `useEffect` 안에서 파생값을 `setState`로 저장하는 패턴을 금지한다 |
| [no-sort-for-minmax](#no-sort-for-minmax) | 정렬 후 첫/마지막 요소로 min/max를 구하는 패턴을 금지한다 |
| [no-trivial-usememo](#no-trivial-usememo) | 단순 표현식을 `useMemo`로 감싸는 패턴을 금지한다 |
| [prefer-flatmap](#prefer-flatmap) | `.map().filter()` 및 `.filter().map()` 대신 `.flatMap()` 사용을 권장한다 |
| [require-async-error-handling](#require-async-error-handling) | `async` 함수에서 `await` 사용 시 `try-catch` 또는 `.catch()`로 에러 처리를 강제한다 |
| [require-barrel-export](#require-barrel-export) | 주요 디렉토리에 barrel export(`index.ts`)가 없으면 경고한다 |
| [require-functional-setstate](#require-functional-setstate) | 이전 state를 참조하는 `setState` 호출에는 함수형 업데이트를 강제한다 |

---

## enforce-filename-convention

### 개요

파일이 위치한 디렉토리 경로를 기준으로, 각 카테고리에 맞는 파일명 컨벤션을 강제합니다.

| 카테고리 | 적용 경로 | 요구 형식 | 예시 |
|----------|-----------|-----------|------|
| 컴포넌트 | `src/components/`, `src/features/*/components/` | `kebab-case.tsx` | `user-profile.tsx` |
| 훅 | `src/hooks/`, `src/features/*/hooks/` | `useXxx.ts` (use + PascalCase) | `useAuth.ts` |
| 유틸 | `src/utils/` | `kebab-case.ts` | `format-date.ts` |
| 상수 | `src/constants/` | `UPPER_SNAKE_CASE.ts` | `API_ENDPOINTS.ts` |
| 스토어 | `src/store/` | `[domain].store.ts` | `auth.store.ts` |
| API | `src/services/`, `src/features/*/api/` | `[domain].api.ts` | `auth.api.ts` |
| 타입 | `src/types/` | `kebab-case.ts` | `user-types.ts` |

### 예외 (검사 제외)

- `index.ts` / `index.tsx` (배럴 익스포트 파일)
- `_`로 시작하는 파일 (예: `_layout.tsx` — Expo Router 예약 파일)
- `+`로 시작하는 파일 (예: `+not-found.tsx` — Expo Router 특수 파일)
- `src/features/**/types.ts` (feature 내부 고정 타입 파일)

### Correct

```
src/components/user-profile.tsx
src/features/auth/components/auth-form.tsx
src/hooks/useAuth.ts
src/features/auth/hooks/useAuthForm.ts
src/utils/format-date.ts
src/constants/API_ENDPOINTS.ts
src/store/auth.store.ts
src/services/auth.api.ts
src/features/payment/api/payment.api.ts
src/types/user-types.ts

// 예외 — 항상 허용
src/components/index.tsx
src/app/_layout.tsx
src/app/+not-found.tsx
src/features/auth/types.ts
```

### Incorrect

```
// ❌ 컴포넌트 — PascalCase 사용
src/components/UserProfile.tsx
// Error: 컴포넌트 파일명은 kebab-case를 사용하세요. (예: user-profile.tsx)

// ❌ 훅 — use 접두사 없음
src/hooks/AuthHook.ts
// Error: 훅 파일명은 use로 시작하는 PascalCase를 사용하세요. (예: useAuth.ts)

// ❌ 상수 — camelCase 사용
src/constants/apiEndpoints.ts
// Error: 상수 파일명은 UPPER_SNAKE_CASE를 사용하세요. (예: API_ENDPOINTS.ts)

// ❌ 스토어 — .store.ts 접미사 없음
src/store/authStore.ts
// Error: 스토어 파일명은 [domain].store.ts 형식을 사용하세요. (예: auth.store.ts)

// ❌ API — .api.ts 접미사 없음
src/services/authService.ts
// Error: API 파일명은 [domain].api.ts 형식을 사용하세요. (예: auth.api.ts)
```

---

## js-hoist-regexp

### 개요

루프(`for`, `while`, `forEach`, `map` 등) 안에서 정규식 리터럴(`/pattern/`) 또는 `new RegExp()` 생성자를 호출하는 패턴을 금지합니다. 정규식은 매 반복마다 새로 컴파일되므로 성능 낭비가 발생합니다.

### Correct

```js
// ✅ 루프 밖에서 상수로 선언
const RE = /pattern/g;
items.forEach(item => RE.test(item.name));
```

### Incorrect

```js
// ❌ 루프 안에서 정규식 리터럴 생성
items.forEach(item => {
  const re = /pattern/g; // Error: 루프 안에서 정규식을 반복 생성하지 마세요.
  re.test(item.name);
});

// ❌ 루프 안에서 new RegExp() 생성
for (const item of items) {
  const re = new RegExp('test'); // Error: 루프 안에서 정규식을 반복 생성하지 마세요.
}
```

---

## js-index-maps

### 개요

같은 배열에 대해 `.find()` 또는 `.filter()`를 3회 이상 호출하는 경우, `Map`으로 인덱싱하여 O(1) 조회를 사용하도록 유도합니다.

### Correct

```js
// ✅ Map으로 인덱싱하여 O(1) 조회
const userMap = new Map(users.map(u => [u.id, u]));
userMap.get(idA);
userMap.get(idB);
userMap.get(idC);

// ✅ 1~2회 조회는 허용
const user = users.find(u => u.id === idA);
```

### Incorrect

```js
// ❌ 같은 배열을 3번 이상 순회
const userA = users.find(u => u.id === idA); // Error
const userB = users.find(u => u.id === idB); // Error
const userC = users.find(u => u.id === idC); // Error
// Error: 같은 배열을 반복 탐색하지 마세요. Map으로 인덱싱하여 O(1) 조회를 사용하세요.
```

---

## max-file-lines

### 개요

파일 경로에 따라 최대 라인 수를 제한합니다. 파일이 너무 길어지면 분리를 권장합니다.

| 경로 패턴 | 최대 라인 수 |
|-----------|-------------|
| `src/components/ui/**` | 200 |
| `src/components/**` | 250 |
| `src/features/**/components/**` | 250 |
| `src/features/**/hooks/**` | 200 |
| `src/hooks/**` | 200 |
| `src/features/**/api/**` | 150 |
| `src/services/**` | 150 |
| `src/store/**` | 150 |
| `src/utils/**` | 100 |
| `src/**` (그 외) | 250 |

### 예외 (검사 제외)

- `index.ts` / `index.tsx`
- `types.ts`
- `*.generated.ts` / `*.g.ts`

### Correct

```ts
// ✅ src/utils/format-date.ts — 100줄 이하
export function formatDate(date: Date) { ... }
```

### Incorrect

```ts
// ❌ src/utils/parse-token.ts — 101줄 이상
// Error: 이 파일은 101줄입니다. 최대 100줄을 초과했습니다. 파일을 분리하는 것을 고려하세요.
```

---

## no-find-in-loop

### 개요

`forEach`, `map`, `filter`, `reduce` 콜백 및 `for`, `while` 루프 안에서 `.find()` / `.findIndex()` 호출을 금지합니다. O(n²) 복잡도가 발생하므로 사전에 `Map`으로 인덱싱하세요.

### Correct

```js
// ✅ 루프 밖에서 find 사용
const user = users.find(u => u.id === id);

// ✅ Map 인덱싱으로 O(1) 조회
const userMap = new Map(users.map(u => [u.id, u]));
orders.forEach(order => userMap.get(order.userId));
```

### Incorrect

```js
// ❌ forEach 콜백 안에서 find
orders.forEach(order => {
  const user = users.find(u => u.id === order.userId); // Error
});

// ❌ for...of 안에서 findIndex
for (const order of orders) {
  users.findIndex(u => u.id === order.userId); // Error
}
// Error: 루프 안에서 .find()/.findIndex()를 사용하지 마세요. O(n²)입니다.
```

---

## no-function-call-in-usestate

### 개요

`useState`의 초기값으로 함수 호출 결과를 직접 전달하는 패턴을 금지합니다. 함수 호출 결과는 매 렌더마다 실행되므로, 초기화 비용이 큰 경우 lazy initializer(함수 참조)로 전달해야 합니다.

### Correct

```js
// ✅ lazy initializer — 함수 참조 전달
const [state] = useState(() => buildSearchIndex(items));

// ✅ 리터럴 / 변수는 허용
const [count] = useState(0);
const [value] = useState(someVariable);
```

### Incorrect

```js
// ❌ 함수 호출 결과를 직접 전달
const [state] = useState(buildSearchIndex(items));
// Error: useState에 함수 호출 결과를 직접 전달하지 마세요. 렌더마다 실행됩니다.

const [state] = useState(parseJSON(data));
// Error: useState에 함수 호출 결과를 직접 전달하지 마세요.
```

---

## no-includes-in-loop

### 개요

`forEach`, `map`, `filter`, `reduce` 콜백 및 `for`, `while` 루프 안에서 배열의 `.includes()` 호출을 금지합니다. O(n²) 복잡도가 발생하므로 `Set`으로 변환하여 `.has()`를 사용하세요. (문자열 리터럴의 `.includes()`는 허용)

### Correct

```js
// ✅ Set 변환 후 O(1) 조회
const allowed = new Set(allowedIds);
items.forEach(item => allowed.has(item.id));

// ✅ 문자열 리터럴의 includes는 허용
for (const item of items) {
  if ('abc'.includes(item.kind)) {}
}
```

### Incorrect

```js
// ❌ 루프 안에서 배열 includes
items.forEach(item => {
  if (allowedIds.includes(item.id)) {} // Error
});

for (const item of items) {
  blockedList.includes(item.name); // Error
}
// Error: 루프 안에서 .includes()를 사용하지 마세요. O(n²)입니다.
```

---

## no-relative-import-outside-feature

### 개요

`src/features/` 하위 파일에서 feature 외부 모듈을 참조할 때 상대경로(`../`) 대신 절대경로(`@/`)를 사용하도록 강제합니다. `../../`처럼 2단계 이상 올라가거나 현재 feature 루트를 벗어나는 경우에 오류를 보고합니다.

### Correct

```ts
// ✅ feature 내부 참조는 상대경로 허용
// 파일: src/features/auth/hooks/use-auth.ts
import { authApi } from '../api/auth.api';

// ✅ feature 외부 참조는 절대경로 사용
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';
```

### Incorrect

```ts
// ❌ feature 외부를 상대경로로 참조
// 파일: src/features/auth/hooks/use-auth.ts
import { Button } from '../../components/ui/button';
// Error: feature 외부 모듈은 상대경로 대신 절대경로(@/)를 사용하세요.
```

---

## no-setstate-in-effect-for-derived

### 개요

`useEffect` 안에서 다른 state 값만으로 계산할 수 있는 파생값을 `setState`로 저장하는 패턴을 금지합니다. 비동기 작업(await, fetch, axios 등)이 포함된 effect는 예외입니다.

### Correct

```js
// ✅ 렌더 중 직접 계산
function Comp() {
  const [first] = useState('');
  const [last] = useState('');
  const fullName = first + ' ' + last; // 파생값은 변수로
}

// ✅ 비동기 작업이 있는 effect는 허용
useEffect(() => {
  fetchUser().then(data => setUser(data));
}, []);
```

### Incorrect

```js
// ❌ 다른 state 값만으로 파생 가능한 값을 setState로 저장
function Comp() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(first + ' ' + last); // Error
  }, [first, last]);
}
// Error: useEffect 안에서 파생값을 setState로 저장하지 마세요.
```

---

## no-sort-for-minmax

### 개요

배열을 정렬(`sort`)한 뒤 첫 번째(`[0]` 또는 `.at(0)`) 또는 마지막(`.at(-1)`) 요소로 최솟값/최댓값을 구하는 패턴을 금지합니다. O(n log n) 대신 `Math.max()` / `Math.min()`을 사용하세요.

### Correct

```js
// ✅ Math.max / Math.min 사용
const max = Math.max(...items);
const min = items.reduce((a, b) => a < b ? a : b);
```

### Incorrect

```js
// ❌ sort 후 [0] 인덱스로 최댓값
const max = items.sort((a, b) => b - a)[0];
// Error: 정렬로 최솟값/최댓값을 구하지 마세요. O(n log n)입니다.

// ❌ sort 후 .at(-1)로 최솟값
const min = items.sort((a, b) => a - b).at(-1);
// Error: 정렬로 최솟값/최댓값을 구하지 마세요.
```

---

## no-trivial-usememo

### 개요

단순 식별자, 산술/논리 연산, 멤버 접근, 템플릿 리터럴 등 메모이제이션 비용보다 계산 비용이 낮은 단순 표현식에 `useMemo`를 사용하는 패턴을 금지합니다.

### Correct

```js
// ✅ 복잡한 연산은 useMemo 사용 적절
const filtered = useMemo(() => items.filter(i => i.active).map(i => i.id), [items]);

const sorted = useMemo(() => {
  return [...items].sort(compare);
}, [items]);
```

### Incorrect

```js
// ❌ 단순 논리 연산에 useMemo
const isLoading = useMemo(() => a.isLoading || b.isLoading, [a, b]);
// Error: 단순 표현식에 useMemo를 사용하지 마세요.

// ❌ 단순 산술 연산에 useMemo
const total = useMemo(() => price + tax, [price, tax]);
// Error: 단순 표현식에 useMemo를 사용하지 마세요. 그냥 변수로 선언하세요.
```

---

## prefer-flatmap

### 개요

`.map().filter()` 또는 `.filter().map()` 패턴을 감지하여 `.flatMap()` 사용을 권장합니다. 두 번 배열을 순회하는 대신 한 번에 처리할 수 있습니다.

### Correct

```js
// ✅ flatMap으로 한 번에 처리
items.flatMap(x => x ? [x] : []);

// ✅ 단일 map/filter는 허용
items.map(transform);
```

### Incorrect

```js
// ❌ map 후 filter
items.map(transform).filter(Boolean);
// Error: .map().filter() 또는 .filter().map() 대신 .flatMap()을 사용하세요.

// ❌ filter 후 map
items.filter(isActive).map(toLabel);
// Error: 배열 순회 횟수를 줄일 수 있습니다.
```

---

## require-async-error-handling

### 개요

`async` 함수에서 `await` 사용 시 반드시 `try-catch`로 감싸거나, `.then()` 체이닝 시 반드시 `.catch()`를 추가하도록 강제합니다.

### Correct

```js
// ✅ try-catch 사용
async function fetchData() {
  try {
    const data = await fetchUser();
  } catch (error) {
    console.error(error);
  }
}

// ✅ .catch() 체이닝
fetchUser()
  .then(data => setUser(data))
  .catch(error => console.error(error));
```

### Incorrect

```js
// ❌ try-catch 없는 await
async function fetchData() {
  const data = await fetchUser(); // Error
}
// Error: 비동기 호출은 반드시 try-catch 또는 .catch()로 에러를 처리하세요.

// ❌ .catch() 없는 .then()
fetchUser().then(data => setUser(data)); // Error
```

---

## require-barrel-export

### 개요

다음 대상 디렉토리에 `index.ts` 또는 `index.tsx`가 없으면 경고합니다.

- `src/components/`
- `src/hooks/`
- `src/utils/`
- `src/features/[featureName]/` (features 바로 아래 1단계)

### Correct

```
// ✅ index.ts가 존재하는 경우
src/components/button.tsx
src/components/index.ts  ← 존재
```

### Incorrect

```
// ❌ src/components/ 에 index.ts 없음
src/components/button.tsx
// Error: 이 디렉토리에 index.ts 가 없습니다. barrel export 파일을 추가하세요.

// ❌ src/features/auth/ 에 index.ts 없음
src/features/auth/view.tsx
// Error: 이 디렉토리에 index.ts 가 없습니다.
```

---

## require-functional-setstate

### 개요

`setState` 호출 시 인자 표현식 안에 해당 state 변수를 직접 참조하는 경우, 함수형 업데이트(`setState(prev => ...)`) 형태를 사용하도록 강제합니다. Closure stale 문제를 방지합니다.

### Correct

```js
// ✅ 함수형 업데이트 사용
setCount(c => c + 1);
setItems(prev => [...prev, newItem]);

// ✅ state를 참조하지 않는 경우는 허용
setCount(nextValue);
```

### Incorrect

```js
// ❌ state 변수를 직접 참조하여 setState
function Comp() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Error
}
// Error: 이전 state를 참조하는 setState는 함수형 업데이트를 사용하세요. (예: setCount(c => c + 1))

function Comp() {
  const [items, setItems] = useState([]);
  setItems([...items, newItem]); // Error
}
```
