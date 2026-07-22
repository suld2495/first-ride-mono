import type { User } from '@repo/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { isRetryable } from '../../api';
import { AppError } from '../../api/AppError';

interface QueryProviderProps {
  children: React.ReactNode;
  userId: User['userId'] | null;
}

const QueryClientBoundary = ({
  children,
}: Pick<QueryProviderProps, 'children'>) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof AppError) {
                return isRetryable(error) && failureCount < 3;
              }

              return false;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(
    () => () => {
      queryClient.clear();
    },
    [queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export const QueryProvider = ({ children, userId }: QueryProviderProps) => (
  <QueryClientBoundary key={userId ?? 'anonymous'}>
    {children}
  </QueryClientBoundary>
);
