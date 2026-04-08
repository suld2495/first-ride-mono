# tanstack-query ESLint Local Rules

TanStack Query(React Query) 사용 패턴, 쿼리 키 컨벤션, 캐시 관리에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [infinite-query-requires-page-param](#infinite-query-requires-page-param) | `useInfiniteQuery`에 필수 pagination 옵션을 강제한다 |
| [mutation-must-handle-cache-sync](#mutation-must-handle-cache-sync) | `useMutation` 이후 캐시 동기화 처리를 강제한다 |
| [no-dynamic-usequery-in-loops](#no-dynamic-usequery-in-loops) | 루프와 조건문 안의 동적 `useQuery` 호출을 금지한다 |
| [no-global-invalidate-queries](#no-global-invalidate-queries) | 전역 `invalidateQueries` 호출을 금지한다 |
| [query-fn-must-use-abort-signal](#query-fn-must-use-abort-signal) | `queryFn`에서 네트워크 요청 시 `abort signal` 전달을 강제한다 |
| [query-key-first-segment-static](#query-key-first-segment-static) | `queryKey` 첫 세그먼트를 고정 문자열 리터럴로 제한한다 |
| [query-key-must-be-array](#query-key-must-be-array) | `queryKey`를 배열 또는 팩토리 호출로 제한한다 |
| [query-key-must-use-factory](#query-key-must-use-factory) | `queryKey` 직접 배열 작성을 금지하고 factory 사용을 강제한다 |
| [query-key-no-nonserializable-values](#query-key-no-nonserializable-values) | `queryKey` 안에 직렬화 불가능한 값을 금지한다 |
| [require-enabled-on-conditional-query](#require-enabled-on-conditional-query) | 조건부 파라미터를 사용하는 쿼리에 `enabled` 옵션을 강제한다 |
| [suspense-query-requires-error-boundary](#suspense-query-requires-error-boundary) | `useSuspenseQuery` 사용 시 `useQueryErrorResetBoundary`를 강제한다 |

---

## infinite-query-requires-page-param

### 개요

`useInfiniteQuery` 호출에 `initialPageParam`과 `getNextPageParam`이 반드시 있어야 합니다.

### Correct

```ts
// ✅ 두 가지 옵션 모두 명시
useInfiniteQuery({
  queryKey: postKeys.infinite(),
  queryFn: ({ pageParam }) => postApi.getPage(pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
});
```

### Incorrect

```ts
// ❌ initialPageParam 또는 getNextPageParam 누락
useInfiniteQuery({
  queryKey: postKeys.infinite(),
  queryFn: ({ pageParam }) => postApi.getPage(pageParam),
  // initialPageParam 없음
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
// Error: useInfiniteQuery에는 반드시 initialPageParam과 getNextPageParam을 명시하세요.
```

---

## mutation-must-handle-cache-sync

### 개요

`useMutation` 호출의 `onSuccess` 또는 `onSettled` 콜백에서 반드시 캐시 동기화 처리를 해야 합니다.

인정되는 캐시 동기화 함수: `invalidateQueries`, `setQueryData`, `refetchQueries`, `removeQueries`

### Correct

```ts
// ✅ onSuccess에서 캐시 무효화
useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: postKeys.all() });
  },
});

// ✅ onSettled에서 캐시 갱신
useMutation({
  mutationFn: updateUser,
  onSettled: (data) => {
    queryClient.setQueryData(userKeys.detail(data.id), data);
  },
});
```

### Incorrect

```ts
// ❌ 캐시 동기화 없음
useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    toast.success('생성 완료');
    // invalidateQueries 없음
  },
});
// Error: useMutation 후 반드시 캐시를 동기화하세요.
// onSuccess 또는 onSettled 에서 invalidateQueries 또는 setQueryData를 호출하세요.
```

---

## no-dynamic-usequery-in-loops

### 개요

루프(`for`, `while`), 조건문(`if`, 삼항), 콜백 함수 안에서 `useQuery`를 호출하는 것을 금지합니다. React hooks 규칙 위반입니다. 동적 병렬 조회에는 `useQueries`를 사용하세요.

### Correct

```ts
// ✅ useQueries로 동적 병렬 조회
const queries = useQueries({
  queries: ids.map(id => ({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUser(id),
  })),
});
```

### Incorrect

```ts
// ❌ 루프 안에서 useQuery
ids.forEach(id => {
  const { data } = useQuery({ // Error
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUser(id),
  });
});
// Error: 루프나 조건문 안에서 useQuery를 사용하지 마세요. React hooks 규칙 위반입니다.
// 동적 병렬 조회는 useQueries를 사용하세요.
```

---

## no-global-invalidate-queries

### 개요

`invalidateQueries()`를 인자 없이 호출하거나 `queryKey` / `predicate` 없이 호출하는 것을 금지합니다. 의도치 않은 전체 캐시 무효화를 방지합니다.

### Correct

```ts
// ✅ queryKey 지정
queryClient.invalidateQueries({ queryKey: ['users'] });

// ✅ predicate 지정
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === 'users',
});
```

### Incorrect

```ts
// ❌ 인자 없이 전체 무효화
queryClient.invalidateQueries();
// Error: invalidateQueries()를 조건 없이 호출하지 마세요.

// ❌ queryKey/predicate 없는 객체 전달
queryClient.invalidateQueries({ exact: false });
// Error: 반드시 queryKey 또는 predicate를 지정하세요.
```

---

## query-fn-must-use-abort-signal

### 개요

`queryFn` 내부에서 `fetch()` 또는 `axios` 요청 시 `signal`을 반드시 전달해야 합니다. 쿼리 취소 시 네트워크 요청도 함께 취소됩니다.

### Correct

```ts
// ✅ signal 전달
useQuery({
  queryKey: userKeys.detail(id),
  queryFn: async ({ signal }) => {
    const res = await fetch(`/api/users/${id}`, { signal });
    return res.json();
  },
});

// ✅ axios에 signal 전달
queryFn: async ({ signal }) => {
  return axios.get(`/users/${id}`, { signal });
},
```

### Incorrect

```ts
// ❌ signal 없는 fetch
useQuery({
  queryKey: userKeys.detail(id),
  queryFn: async () => {
    const res = await fetch(`/api/users/${id}`); // Error
    return res.json();
  },
});
// Error: queryFn에서 네트워크 요청 시 반드시 signal을 전달하세요.
```

---

## query-key-first-segment-static

### 개요

`useQuery`, `useInfiniteQuery`, `useQueries`, `prefetchQuery`, `ensureQueryData`, `invalidateQueries`, `setQueryData`의 `queryKey` 첫 번째 세그먼트는 반드시 고정 문자열 리터럴이어야 합니다.

### Correct

```ts
// ✅ 첫 세그먼트가 문자열 리터럴
useQuery({ queryKey: ['users', id] });
useQuery({ queryKey: ['todos', filter] });
```

### Incorrect

```ts
// ❌ 첫 세그먼트가 변수
const entity = 'users';
useQuery({ queryKey: [entity, id] });
// Error: queryKey의 첫 번째 세그먼트는 반드시 고정 문자열 리터럴이어야 합니다.

// ❌ 첫 세그먼트가 숫자
useQuery({ queryKey: [1, id] });
// Error: (예: ['users', id], ['todos', filter])
```

---

## query-key-must-be-array

### 개요

`queryKey`는 반드시 배열 표현식 또는 factory 함수 호출이어야 합니다.

### Correct

```ts
// ✅ 배열 표현식
useQuery({ queryKey: ['users', id] });

// ✅ factory 호출
useQuery({ queryKey: userKeys.detail(id) });
```

### Incorrect

```ts
// ❌ 문자열 직접 전달
useQuery({ queryKey: 'users' });
// Error: queryKey는 반드시 배열이어야 합니다. (예: queryKey: ['todos'])

// ❌ 변수 직접 전달
useQuery({ queryKey: myKey });
// Error: queryKey는 반드시 배열이어야 합니다.
```

---

## query-key-must-use-factory

### 개요

`queryKey`에 배열을 직접 작성하는 것을 금지하고 query key factory 패턴 사용을 강제합니다. `Keys` 또는 `Queries` 로 끝나는 객체의 함수 호출 또는 `.queryKey` 접근을 factory로 인정합니다.

### Correct

```ts
// ✅ query key factory 사용
const userKeys = {
  all: () => ['users'] as const,
  detail: (id: string) => [...userKeys.all(), id] as const,
};

useQuery({ queryKey: userKeys.detail(id) });
useQuery({ queryKey: userKeys.all() });
```

### Incorrect

```ts
// ❌ 배열 직접 작성
useQuery({ queryKey: ['users', id] });
// Error: queryKey를 직접 배열로 작성하지 마세요. query key factory를 사용하세요.
// (예: todoKeys.all(), todoKeys.detail(id))

useQuery({ queryKey: ['todos', 'list', filter] });
// Error: query key factory를 사용하세요.
```

---

## query-key-no-nonserializable-values

### 개요

`queryKey` 배열 안에 직렬화 불가능한 값(함수, `Date`, `Map`, `Set`, `Symbol`)을 넣는 것을 금지합니다. 캐시 키로 불안정한 동작을 유발합니다.

### Correct

```ts
// ✅ 직렬화 가능한 값만 사용
useQuery({ queryKey: ['users', id, { status: 'active' }] });
useQuery({ queryKey: ['posts', dateString] }); // 문자열로 변환
```

### Incorrect

```ts
// ❌ 함수 포함
useQuery({ queryKey: ['users', () => id] });
// Error: queryKey에 직렬화 불가능한 값을 사용하지 마세요.

// ❌ Date 객체 포함
useQuery({ queryKey: ['posts', new Date()] });
// Error: 함수, Date, Map, Set, Symbol은 캐시 키로 불안정합니다.

// ❌ Map/Set 포함
useQuery({ queryKey: ['items', new Map([[1, 'a']])] });
```

---

## require-enabled-on-conditional-query

### 개요

`useQuery` 또는 `useInfiniteQuery`의 `queryKey`나 `queryFn`에 `id`, `slug`, `token`, `code`, `key` 등 조건부로 존재할 수 있는 파라미터가 사용될 때, `enabled` 옵션을 반드시 명시하도록 강제합니다. `enabled` 없이 파라미터가 `undefined`인 상태로 쿼리가 실행되면 잘못된 API 호출이 발생합니다.

### Correct

```ts
// ✅ enabled 옵션 명시
function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.getUser(userId!),
    enabled: Boolean(userId),
  });
}

// ✅ queryFn 내부에서 guard 처리
function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: ({ signal }) => {
      if (!postId) return null;
      return postApi.getPost(postId, signal);
    },
    enabled: Boolean(postId),
  });
}
```

### Incorrect

```ts
// ❌ enabled 없이 조건부 파라미터 사용
function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.getUser(userId!), // userId가 undefined일 때 호출됨
  });
}
// Error: 조건부 파라미터가 queryFn에 사용될 때는 enabled 옵션으로 실행 조건을 명시하세요.

// ❌ slug를 enabled 없이 사용
function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ['articles', slug],
    queryFn: () => articleApi.getBySlug(slug!),
  });
}
// Error: 조건부 파라미터가 queryFn에 사용될 때는 enabled 옵션으로 실행 조건을 명시하세요.
```

---

## suspense-query-requires-error-boundary

### 개요

`useSuspenseQuery` 또는 `useSuspenseQueries`를 사용하는 컴포넌트에서 반드시 `useQueryErrorResetBoundary`를 함께 사용해야 합니다. 에러 발생 시 복구할 수 없게 됩니다.

### Correct

```ts
// ✅ useQueryErrorResetBoundary 함께 사용
function UserProfile() {
  const { reset } = useQueryErrorResetBoundary();
  const { data } = useSuspenseQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUser(id),
  });
  return <View />;
}
```

### Incorrect

```ts
// ❌ useQueryErrorResetBoundary 없음
function UserProfile() {
  const { data } = useSuspenseQuery({ // Error
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUser(id),
  });
  return <View />;
}
// Error: useSuspenseQuery 사용 시 반드시 useQueryErrorResetBoundary를 함께 사용하세요.
```
