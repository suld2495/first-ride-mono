import { QueryProvider } from '@repo/shared/components';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
  children: React.JSX.Element;
}

const WebQueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryProvider>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryProvider>
  );
};

export default WebQueryProvider;
