import { useFriendProfileQuery } from '@repo/shared/hooks/useFriend';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

describe('useFriendProfileQuery', () => {
  it('친구 ID가 없으면 유효한 쿼리 함수 오류를 발생시키지 않는다', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useFriendProfileQuery(undefined), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
    queryClient.clear();
  });
});
