import axiosInstance from '@repo/shared/api';
import { useDeleteAccountMutation } from '@repo/shared/hooks/useAuth';
import { authKey } from '@repo/shared/types/query-keys/auth';
import { userKey } from '@repo/shared/types/query-keys/user';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const TestQueryProvider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  TestQueryProvider.displayName = 'DeleteAccountHookTestProvider';

  return TestQueryProvider;
};

describe('useDeleteAccountMutation', () => {
  it('탈퇴 성공 후 인증 및 사용자 캐시를 제거한다', async () => {
    const mockAxios = new MockAdapter(axiosInstance);
    const queryClient = createTestQueryClient();

    queryClient.setQueryData(authKey.session(), { userId: 'plain-user' });
    queryClient.setQueryData(userKey.me('plain-user'), {
      userId: 'plain-user',
    });
    mockAxios.onDelete('/auth/me').reply(200, {
      data: { message: '회원탈퇴가 완료되었습니다.' },
    });

    const { result } = renderHook(() => useDeleteAccountMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ password: 'current-password' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(queryClient.getQueryData(authKey.session())).toBeNull();
    expect(queryClient.getQueryData(userKey.me('plain-user'))).toBeUndefined();

    mockAxios.restore();
  });
});
