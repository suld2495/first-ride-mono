import { Outlet } from 'react-router';

import ModalProvider from '@/components/providers/ModalProvider';

import Footer from './Footer';
import AuthProvider from '@/components/providers/AuthProvider';

const Layout = () => {
  return (
    <AuthProvider>
      <div className="h-dvh max-w-[var(--max-width)] mx-auto shadow-sm dark:shadow-white">
        <Outlet />
        <Footer />
        <ModalProvider />
      </div>
    </AuthProvider>
  );
};

export default Layout;
