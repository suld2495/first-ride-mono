import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import router from './router/index.tsx';
import '@/api';

import './index.css';
import WebQueryProvider from './components/providers/WebQueryProvider.tsx';

async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  await worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <WebQueryProvider>
      <RouterProvider router={router} />
    </WebQueryProvider>,
  );
});
