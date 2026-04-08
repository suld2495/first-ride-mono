# web ESLint Local Rules

웹(Next.js) 환경의 성능, 보안, 접근성에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [no-animate-svg-directly](#no-animate-svg-directly) | `<svg>`에 직접 애니메이션 클래스를 적용하는 패턴을 금지한다 |
| [no-global-init-in-effect](#no-global-init-in-effect) | 빈 deps `useEffect` 안에서 전역 초기화 코드를 금지한다 |
| [no-mutable-module-state](#no-mutable-module-state) | 서버 파일의 모듈 레벨 mutable 상태를 금지한다 |
| [require-passive-event-listener](#require-passive-event-listener) | scroll/touch/wheel 이벤트 리스너에 `passive` 옵션을 강제한다 |
| [require-script-defer-or-async](#require-script-defer-or-async) | `<script>` 태그에 `defer` 또는 `async` 속성을 강제한다 |

---

## no-animate-svg-directly

### 개요

`<svg>` 엘리먼트의 `className`에 `animate-*`, `transition-*`, `motion-*` 등 애니메이션 관련 Tailwind 클래스를 직접 적용하는 것을 금지합니다. wrapper `div`에 적용하세요. SVG에 직접 적용하면 일부 브라우저에서 예상치 못한 렌더링 문제가 발생합니다.

### Correct

```tsx
// ✅ wrapper div에 애니메이션 클래스 적용
<div className="animate-spin">
  <svg viewBox="0 0 24 24">...</svg>
</div>

<div className="transition-opacity">
  <svg>...</svg>
</div>
```

### Incorrect

```tsx
// ❌ svg에 직접 animate 클래스 적용
<svg className="animate-spin" viewBox="0 0 24 24">...</svg>
// Error: <svg>에 직접 애니메이션 클래스를 적용하지 마세요. wrapper div에 적용하세요.

<svg className="transition-opacity motion-safe:animate-bounce">...</svg>
// Error: <svg>에 직접 애니메이션 클래스를 적용하지 마세요.
```

---

## no-global-init-in-effect

### 개요

빈 의존성 배열(`[]`)을 가진 `useEffect` 안에서 `init*`, `setup*`, `initialize*`, `configure*`로 시작하는 전역 초기화 함수를 호출하는 것을 금지합니다. React StrictMode에서 두 번 실행되어 예상치 못한 부작용이 발생할 수 있습니다.

### Correct

```ts
// ✅ 모듈 레벨에서 한 번만 초기화
initAnalytics();

// ✅ 비동기 초기화는 허용
useEffect(() => {
  setupPushNotification().then(() => { ... });
}, []);

// ✅ guard 패턴 사용
useEffect(() => {
  if (initialized) return;
  initSDK();
}, []);
```

### Incorrect

```ts
// ❌ 빈 deps useEffect 안에서 전역 초기화
useEffect(() => {
  initAnalytics(); // Error
  setupTracking(); // Error
}, []);
// Error: 빈 deps useEffect 안에서 전역 초기화를 하지 마세요.
// StrictMode에서 두 번 실행됩니다. 모듈 레벨에서 초기화하거나 가드 패턴을 사용하세요.
```

---

## no-mutable-module-state

### 개요

`app/api/**`, `app/**/route.ts`, `app/**/actions.ts`에서 모듈 레벨의 `let` / `var` 선언을 금지합니다. 서버는 요청 간 모듈 상태를 공유하므로 동시 요청 간 데이터 오염 및 보안 문제가 발생합니다.

### Correct

```ts
// ✅ 함수 스코프 안에서 선언
export async function GET() {
  let result = null;
  // ...
}

// ✅ const(읽기 전용)는 허용
const ALLOWED_ORIGINS = ['https://example.com'];
```

### Incorrect

```ts
// ❌ 모듈 레벨 let/var
let currentUser = null; // Error
var requestCache = {};  // Error

export async function GET() {
  currentUser = await getUser();
  return Response.json(currentUser);
}
// Error: 서버 파일에서 모듈 레벨 let/var를 사용하지 마세요.
// 요청 간 데이터가 공유되어 보안 문제가 발생합니다. 함수 스코프 안에서 선언하세요.
```

---

## require-passive-event-listener

### 개요

`scroll`, `touchstart`, `touchmove`, `touchend`, `touchcancel`, `wheel`, `mousewheel` 이벤트 리스너에 `{ passive: true }` 옵션을 강제합니다. passive 옵션 없이는 브라우저가 `preventDefault()` 호출 여부를 매 이벤트마다 확인해야 하므로 스크롤 성능이 저하됩니다.

### Correct

```ts
// ✅ passive 옵션 추가
window.addEventListener('scroll', handleScroll, { passive: true });
element.addEventListener('touchstart', handleTouch, { passive: true });
document.addEventListener('wheel', handleWheel, { passive: true });
```

### Incorrect

```ts
// ❌ passive 옵션 없음
window.addEventListener('scroll', handleScroll);
// Error: scroll/touch/wheel 이벤트 리스너에는 { passive: true }를 추가하세요.

window.addEventListener('touchmove', handleMove, false);
// Error: 스크롤 성능에 직접 영향을 줍니다.
// (예: addEventListener('scroll', handler, { passive: true }))
```

---

## require-script-defer-or-async

### 개요

`src` 속성을 가진 `<script>` 태그에 반드시 `defer` 또는 `async` 속성을 명시하도록 강제합니다. 없으면 HTML 파싱이 차단(render-blocking)되어 페이지 로딩 성능이 저하됩니다. 인라인 `<script>`(src 없음)는 검사에서 제외됩니다.

### Correct

```html
<!-- ✅ defer 속성 추가 -->
<script src="/analytics.js" defer></script>

<!-- ✅ async 속성 추가 -->
<script src="/tracking.js" async></script>

<!-- ✅ 인라인 script는 제외 -->
<script>window.__ENV__ = {};</script>
```

### Incorrect

```html
<!-- ❌ defer/async 없는 외부 script -->
<script src="/analytics.js"></script>
<!-- Error: <script> 태그에 defer 또는 async 속성을 추가하세요. 없으면 HTML 렌더링이 차단됩니다. -->

<script src="/vendor.js" type="text/javascript"></script>
<!-- Error: <script> 태그에 defer 또는 async 속성을 추가하세요. -->
```
