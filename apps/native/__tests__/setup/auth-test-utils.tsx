import React, { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions, waitFor } from '@testing-library/react-native';

// global mock 타입 선언
declare const mockPush: jest.Mock;
declare const mockReplace: jest.Mock;
declare const mockBack: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;
declare const mockUser: { nickname: string; userId: string };
declare const mockAuthStore: {
  user: typeof mockUser | null;
  signIn: jest.Mock;
  signOut: jest.Mock;
};
declare const mockRoutineStore: {
  type: 'number' | 'week';
  setType: jest.Mock;
  routineId: number;
  setRoutineId: jest.Mock;
};
declare const mockRequestStore: {
  requestId: number;
  setRequestId: jest.Mock;
};

// 타입 재export (테스트 파일에서 import 가능)
export type {};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity, // 테스트 중 캐시 무효화 방지
        gcTime: Infinity, // 가비지 컬렉션 방지
      },
      mutations: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();

  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

/**
 * 인증이 필요한 페이지 테스트 전에 mock 상태를 초기화합니다.
 * beforeEach에서 호출하세요.
 */
export const resetAuthMocks = () => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
  Object.keys(mockSearchParams).forEach((key) => delete mockSearchParams[key]);
  mockAuthStore.user = mockUser;
  mockAuthStore.signIn.mockClear();
  mockAuthStore.signOut.mockClear();
  mockRoutineStore.type = 'number';
  mockRoutineStore.setType.mockClear();
  mockRoutineStore.routineId = 0;
  mockRoutineStore.setRoutineId.mockClear();
  mockRequestStore.requestId = 0;
  mockRequestStore.setRequestId.mockClear();
};

/**
 * 비로그인 상태 테스트를 위한 describe 블록을 생성합니다.
 *
 * @example
 * describeAuthRedirect(() => render(<MyPage />));
 */
export const describeAuthRedirect = (
  renderComponent: () => ReturnType<typeof render>,
) => {
  describe('사용자 인증 테스트', () => {
    it('사용자가 로그인되지 않은 경우 로그인 페이지로 리다이렉트된다', async () => {
      mockAuthStore.user = null;

      renderComponent();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/sign-in');
      });
    });
  });
};

// Re-export testing-library
export * from '@testing-library/react-native';
export { customRender as render };
