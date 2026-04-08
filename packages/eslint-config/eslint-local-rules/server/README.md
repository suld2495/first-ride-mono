# server ESLint Local Rules

Next.js 서버 컴포넌트, API 라우트, 서버 액션의 성능과 보안에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [async-api-routes](#async-api-routes) | 서버 핸들러의 독립적인 async waterfall을 금지한다 |
| [cache-dedup](#cache-dedup) | 같은 함수를 같은 인자로 중복 `await` 호출하는 패턴을 금지한다 |
| [hoist-static-io](#hoist-static-io) | 정적 파일 읽기를 매 요청마다 수행하는 패턴을 금지한다 |
| [no-parallel-nested-fetching](#no-parallel-nested-fetching) | 루프 안의 `await`를 금지한다 |
| [no-serialization-large-object](#no-serialization-large-object) | `await` 결과 전체를 클라이언트 컴포넌트 prop으로 전달하는 패턴을 금지한다 |
| [no-shared-module-state](#no-shared-module-state) | 서버 파일의 모듈 레벨 mutable 상태를 금지한다 |
| [require-auth-in-server-actions](#require-auth-in-server-actions) | 서버 액션 내부의 인증 확인 코드를 강제한다 |

---

## async-api-routes

### 개요

서버 핸들러(`app/api/**`, `app/**/route.ts`, `app/**/actions.ts`)에서 서로 독립적인 async 작업을 순차적으로 `await`하는 waterfall 패턴을 금지합니다. `Promise.all`로 병렬 처리하여 응답 시간을 단축하세요.

### Correct

```ts
// ✅ Promise.all로 병렬 처리
export async function GET() {
  const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
  return Response.json({ user, posts });
}
```

### Incorrect

```ts
// ❌ 독립적인 작업을 순차 실행
export async function GET() {
  const user = await getUser(id);   // Error
  const posts = await getPosts(id); // Error
  return Response.json({ user, posts });
}
// Error: 서버 핸들러에서 독립적인 async 작업은 Promise.all로 병렬 처리하세요.
```

---

## cache-dedup

### 개요

`app/**`, `src/features/**/api/**`, `src/services/**`에서 같은 함수를 같은 인자로 중복 `await` 호출하는 패턴을 금지합니다. React `cache()`로 deduplication하세요.

### Correct

```ts
// ✅ cache()로 dedupe
import { cache } from 'react';
const getCachedUser = cache(getUser);

const userA = await getCachedUser(id);
const userB = await getCachedUser(id); // 캐시 히트
```

### Incorrect

```ts
// ❌ 같은 함수/인자로 중복 호출
const userA = await getUser(id); // Error
const userB = await getUser(id); // Error
// Error: 같은 함수를 같은 인자로 중복 호출하지 마세요. React cache()로 dedupe하세요.
```

---

## hoist-static-io

### 개요

`app/api/**`, `app/**/route.ts`에서 `fs.readFileSync()`, `fs.readFile()`, `JSON.parse(fs.read*())` 등 정적 파일 읽기를 함수 내부에서 실행하는 것을 금지합니다. 모듈 레벨에서 한 번만 읽으세요.

### Correct

```ts
// ✅ 모듈 레벨에서 한 번만 읽기
import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

export async function GET() {
  return Response.json(config);
}
```

### Incorrect

```ts
// ❌ 매 요청마다 파일 읽기
export async function GET() {
  const config = JSON.parse(readFileSync('./config.json', 'utf-8')); // Error
  return Response.json(config);
}
// Error: 정적 파일 읽기는 모듈 레벨에서 한 번만 하세요.
```

---

## no-parallel-nested-fetching

### 개요

`app/api/**`, `app/**/route.ts`, `app/**/actions.ts`, `src/features/**/api/**`, `src/services/**`에서 루프(`for`, `while`) 및 `reduce`/`forEach` 콜백 안에서 `await`를 사용하는 것을 금지합니다. N번 순차 fetch가 발생합니다.

### Correct

```ts
// ✅ Promise.all로 병렬 처리
const users = await Promise.all(ids.map(id => getUser(id)));
```

### Incorrect

```ts
// ❌ 루프 안에서 await
const users = [];
for (const id of ids) {
  users.push(await getUser(id)); // Error
}
// Error: 루프 안에서 await를 사용하지 마세요. N번 순차 fetch가 발생합니다.

// ❌ forEach 콜백에서 await
ids.forEach(async (id) => {
  const user = await getUser(id); // Error
});
```

---

## no-serialization-large-object

### 개요

서버에서 `await`로 받은 결과 객체 전체를 클라이언트 컴포넌트의 JSX prop으로 전달하는 것을 금지합니다. 필요한 필드만 전달하여 직렬화 비용을 줄이세요.

### Correct

```tsx
// ✅ 필요한 필드만 전달
const userData = await getUser(id);
return <UserCard name={userData.name} avatar={userData.avatar} />;
```

### Incorrect

```tsx
// ❌ 객체 전체를 prop으로 전달
const user = await getUser(id);
return <UserCard user={user} />;
// Error: 서버에서 받은 객체 전체를 클라이언트 컴포넌트에 전달하지 마세요. 필요한 필드만 전달하세요.
```

---

## no-shared-module-state

### 개요

`app/api/**`, `app/**/route.ts`, `app/**/actions.ts`, `pages/api/**`에서 모듈 레벨의 `let`/`var` 선언을 금지합니다. 동시 요청 간 데이터가 공유되어 오염이 발생할 수 있습니다.

### Correct

```ts
// ✅ 함수 스코프 안에서 선언
export async function GET() {
  let requestData = {};
  // ...
}

// ✅ const는 허용 (읽기 전용)
const ALLOWED_METHODS = ['GET', 'POST'];
```

### Incorrect

```ts
// ❌ 모듈 레벨 mutable 상태
let requestCount = 0; // Error
var cache = {};       // Error

export async function GET() {
  requestCount++;
}
// Error: 서버 파일에서 모듈 레벨 mutable 상태를 사용하지 마세요. 동시 요청 간 데이터 오염이 발생합니다.
```

---

## require-auth-in-server-actions

### 개요

`'use server'` 지시문이 있는 파일의 `app/**/actions.ts`, `**.action.ts` 내 async 함수에는 반드시 인증 확인 코드가 있어야 합니다. 미들웨어는 서버 액션 직접 호출을 막지 못합니다.

인증 확인 함수로 인정되는 목록: `verifySession`, `getSession`, `auth`, `getUser`, `checkAuth`, `requireAuth`

### Correct

```ts
'use server';

export async function updateUser(data: UserData) {
  await verifySession(); // ✅ 인증 확인
  return userService.update(data);
}

export async function deletePost(id: string) {
  const session = await getSession(); // ✅ 인증 확인
  if (!session) throw new Error('Unauthorized');
  return postService.delete(id);
}
```

### Incorrect

```ts
'use server';

export async function updateUser(data: UserData) {
  // ❌ 인증 확인 없음
  return userService.update(data);
}
// Error: 서버 액션에는 반드시 인증 확인 코드가 있어야 합니다.
// (예: await verifySession())
```
