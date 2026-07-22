import { QueryProvider } from '@repo/shared/components';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';

const ClientProbe = ({
  onClient,
}: {
  onClient: (queryClient: QueryClient) => void;
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    onClient(queryClient);
  }, [onClient, queryClient]);

  return null;
};

describe('QueryProvider 인증 범위', () => {
  it('계정이 바뀌면 기존 query·mutation 캐시를 비우고 새 client를 제공한다', async () => {
    let activeClient: QueryClient | undefined;
    const captureClient = (queryClient: QueryClient) => {
      activeClient = queryClient;
    };

    const view = render(
      <QueryProvider userId="account-a">
        <ClientProbe onClient={captureClient} />
      </QueryProvider>,
    );

    await waitFor(() => expect(activeClient).toBeDefined());
    const accountAClient = activeClient as QueryClient;

    act(() => {
      accountAClient.setQueryData(['private', 'account-a'], {
        nickname: 'A 사용자',
      });
      accountAClient.getMutationCache().build(accountAClient, {
        mutationKey: ['private-mutation', 'account-a'],
        mutationFn: async () => undefined,
      });
    });

    view.rerender(
      <QueryProvider userId="account-b">
        <ClientProbe onClient={captureClient} />
      </QueryProvider>,
    );

    await waitFor(() => expect(activeClient).not.toBe(accountAClient));

    expect(accountAClient.getQueryCache().getAll()).toHaveLength(0);
    expect(accountAClient.getMutationCache().getAll()).toHaveLength(0);
    expect(activeClient?.getQueryCache().getAll()).toHaveLength(0);
    expect(activeClient?.getMutationCache().getAll()).toHaveLength(0);
  });
});
