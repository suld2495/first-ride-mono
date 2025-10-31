import { useEffect } from 'react';
import { Outlet } from 'react-router';

import AuthProvider from '@/components/providers/AuthProvider';
import ModalProvider from '@/components/providers/ModalProvider';
import { useDarkModeStore } from '@/store/dark.store';

import AdminFooter from './AdminFooter';

const AdminLayout = () => {
  const isDarkMode = useDarkModeStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <div className="h-dvh max-w-[var(--max-width)] mx-auto shadow-sm dark:shadow-white">
        <Outlet />
        <AdminFooter />
        <ModalProvider />
      </div>
    </AuthProvider>
  );
};

export default AdminLayout;
