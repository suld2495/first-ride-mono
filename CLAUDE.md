# Claude Code 가이드

## 모노레포 코드 관리 규칙

### 디렉토리 구조 및 역할

```
packages/
├── types/              # 공통 타입 정의 (DTO, Models, API 응답 타입)
├── shared/
│   ├── api/            # 서버 API 클라이언트 (axios 기반)
│   ├── hooks/          # TanStack Query API 호출 hooks만 위치
│   └── utils/          # 공통 유틸리티 함수
├── eslint-config/
└── typescript-config/

apps/
├── native/             # 사용자 모바일 앱 (Expo)
│   ├── api/            # 모바일 전용 API (push-token 등)
│   ├── hooks/          # 플랫폼 전용 hooks (useForm, useModal 등)
│   ├── store/          # 상태 관리 (모든 store는 개별 플랫폼에서 관리)
│   └── components/     # 모바일 UI 컴포넌트
└── admin/              # 관리자 웹 (추후 생성)
    ├── api/            # 관리자 전용 API
    ├── hooks/          # 관리자 전용 hooks
    └── store/          # 관리자 전용 상태
```

### API 및 Hooks 관리 원칙

| 구분 | 위치 | 설명 |
|------|------|------|
| 서버 API 클라이언트 | `packages/shared/api/` | axios 기반 API 호출 함수 |
| TanStack Query hooks | `packages/shared/hooks/` | API 호출하는 useQuery/useMutation hooks |
| 플랫폼 전용 hooks | `apps/[platform]/hooks/` | useForm, useModal, useNotifications 등 |
| Store (상태 관리) | `apps/[platform]/store/` | 모든 store는 개별 플랫폼에서 관리 |

### 코드 배치 기준

- **packages/shared에 위치**: 서버 API 클라이언트, TanStack Query hooks, 공통 유틸리티
- **apps/[platform]에 위치**: store, 플랫폼 전용 hooks, UI 컴포넌트

## UI/UX 가이드

### Alert vs Toast 사용 기준

| 구분 | Alert (시스템) | Toast |
|------|---------------|-------|
| **용도** | 사용자 확인/결정이 필요한 시스템 메시지 | 단순 피드백, 정보성 메시지 |
| **예시** | 삭제 확인, 로그아웃 확인, 권한 요청 | 저장 완료, 복사됨, 생성 완료, 네트워크 오류 |
| **특징** | 사용자 액션 필요 (확인/취소) | 자동으로 사라짐 |

- **Alert**: 사용자의 명시적 확인이 필요한 경우에만 사용
- **Toast**: 작업 결과 피드백, 상태 알림 등 정보성 메시지에 사용

## 푸시 알림 데이터 구조

서버에서 푸시 알림 전송 시 사용하는 데이터 구조:

| 필드 | 설명 |
|------|------|
| `title` | 알림 제목 |
| `body` | 알림 본문 |
| `data.screen` | 클릭 시 이동할 화면 경로 (예: `/(tabs)/(afterLogin)/(routine)`) |
| `data.category` | 알림 카테고리 (`routine`) - screen 미지정 시 기본 화면으로 매핑 |

**사용 가능한 화면 경로**: `constants/notifications.ts`의 `DEEP_LINK_SCREENS` 참조

```json
{
  "title": "인증 요청",
  "body": "아침 운동 루틴을 인증해주세요",
  "data": { "screen": "/(tabs)/(afterLogin)/(routine)", "routineId": 42 }
}
```

## 테스트 작성 규칙

### React Native Testing Library 테스트 패턴

#### 서버 API 목킹 패턴

서버 API 테스트 시 `describe` 블록으로 시나리오를 분리하고 `beforeEach`에서 목킹을 설정합니다.

```typescript
import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

describe('API 통합 테스트', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('성공 시', () => {
    beforeEach(() => {
      mockAxios.onPost('/api/endpoint').reply(200, { data: null });
    });

    it('예상된 동작을 수행한다', async () => {
      // 테스트 코드
    });
  });

  describe('에러 발생 시', () => {
    beforeEach(() => {
      mockAxios.onPost('/api/endpoint').reply(400, {
        error: {
          message: '에러 메시지',
          data: [{ field: 'fieldName', message: '필드 에러 메시지' }],
        },
      });
    });

    it('에러 메시지가 표시된다', async () => {
      // 테스트 코드
    });
  });
});
```

#### 요소 존재 여부 검증 패턴

- **요소가 있어야 할 때**: `expect(await findByText('...')).toBeOnTheScreen()`
- **요소가 없어야 할 때**: `await waitFor(() => { expect(queryByText('...')).not.toBeOnTheScreen() })`

```typescript
// 에러가 표시되어야 하는 경우
expect(await findByText('에러 메시지')).toBeOnTheScreen();

// 에러가 표시되지 않아야 하는 경우
await waitFor(() => {
  expect(queryByText('에러 메시지')).not.toBeOnTheScreen();
});
```

#### 공통 Mock 패턴

`jest.setup.js`에 공통 mock이 설정되어 있습니다. 테스트 파일에서는 타입 선언만 추가하면 됩니다.

**사용 가능한 Global Mock:**

```typescript
// 테스트 파일 상단에 타입 선언 추가
declare const mockPush: jest.Mock;
declare const mockReplace: jest.Mock;
declare const mockBack: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;
declare const mockUser: { nickname: string; userId: string };
declare const mockAuthStore: { user: typeof mockUser | null; signIn: jest.Mock; signOut: jest.Mock };
declare const mockRoutineStore: { type: 'number' | 'week'; setType: jest.Mock; routineId: number; setRoutineId: jest.Mock };
```

**Mock 초기화 패턴:**

각 테스트에서 mock 상태를 초기화해야 할 경우 `beforeEach`에서 처리합니다.

```typescript
beforeEach(() => {
  // 함수 mock 초기화
  mockPush.mockClear();

  // 객체 mock 상태 리셋
  Object.keys(mockSearchParams).forEach((key) => delete mockSearchParams[key]);
  mockAuthStore.user = mockUser;
  mockRoutineStore.type = 'number';
});
```

**jest.setup.js에서 제공하는 Mock:**

- `expo-router`: useRouter (push, replace, back), useLocalSearchParams, Link
- `./store/auth.store`: useAuthStore (user, signIn, signOut)
- `./store/routine.store`: useRoutineStore (type, setType, routineId, setRoutineId)
- `./store/request.store`: useRequestStore (requestId, setRequestId)

#### 인증이 필요한 페이지 테스트 (auth-test-utils)

> **중요**: 로그인(`sign-in`), 회원가입(`sign-up`) 페이지를 제외한 모든 페이지 테스트는 반드시 `auth-test-utils`를 사용해야 합니다. 일반 `test-utils`가 아닌 `auth-test-utils`를 import하세요.

**기본 사용법:**

```typescript
import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';

import MyPage from '../../app/my-page';
import {
  describeAuthRedirect,
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../setup/auth-test-utils';

let mockAxios: MockAdapter;

describe('마이 페이지', () => {
  beforeEach(() => {
    resetAuthMocks();  // mock 상태 초기화
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onGet('/api/data').reply(200, { data: [] });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // 공통 인증 테스트 (비로그인시 로그인 페이지로 리다이렉트)
  describeAuthRedirect(() => render(<MyPage />));

  // 페이지별 테스트
  describe('데이터 표시 테스트', () => {
    it('데이터가 표시된다', async () => {
      // ...
    });
  });
});
```

**제공 함수:**

- `resetAuthMocks()`: 모든 mock 상태를 초기화 (beforeEach에서 호출)
- `describeAuthRedirect(renderFn)`: 비로그인시 리다이렉트 테스트 자동 생성
- `render`, `fireEvent`, `waitFor` 등: @testing-library/react-native re-export

#### Mock 데이터 팩토리

API 응답 목킹에 사용할 테스트 데이터를 생성합니다. 타입별로 폴더가 분리되어 있습니다.

**폴더 구조:**

```
__tests__/setup/
├── routine/mock.ts   # Routine, RoutineDetail
├── user/mock.ts      # User
├── friend/mock.ts    # Friend, FriendRequest
├── request/mock.ts   # Request, RequestList
└── quest/mock.ts     # Quest
```

**사용법:**

```typescript
import { createMockRoutines } from '../setup/routine/mock';
import { createMockFriends } from '../setup/friend/mock';

// 기본 옵션으로 2개 생성
mockAxios.onGet('/routine/list').reply(200, { data: createMockRoutines(2) });

// 커스텀 옵션으로 생성
mockAxios.onGet('/routine/list').reply(200, {
  data: createMockRoutines(1, { weeklyCount: 5, routineCount: 5 }),
});
```

**제공되는 팩토리 함수:**

| 폴더 | 함수 |
|------|------|
| routine | `createMockRoutine`, `createMockRoutines`, `createMockRoutineDetail` |
| user | `createMockUser`, `createMockUsers` |
| friend | `createMockFriend`, `createMockFriends`, `createMockFriendRequest`, `createMockFriendRequests` |
| request | `createMockRequest`, `createMockRequests`, `createMockRequestListItem`, `createMockRequestList` |
| quest | `createMockQuest`, `createMockQuests` |

각 팩토리 함수는 타입에 맞는 Options 인터페이스를 제공합니다 (예: `CreateMockRoutineOptions`).
