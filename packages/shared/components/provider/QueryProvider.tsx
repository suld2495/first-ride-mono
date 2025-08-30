import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isRetryable } from '../../api';
import { AppError } from '../../api/AppError';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const queryClient = new QueryClient({
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
      }
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
