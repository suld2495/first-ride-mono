import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import QueryProvider from './components/providers/QueryProvider.tsx';
import router from './router/index.tsx';

import './index.css';

async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  await worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>,
  );
});
