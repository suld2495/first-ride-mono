import { useEffect } from 'react';
import { Outlet } from 'react-router';

import AuthProvider from '@/components/providers/AuthProvider';
import ModalProvider from '@/components/providers/ModalProvider';
import ToastContainer from '@/components/common/ToastContainer';
import { ToastProvider, useToastContext } from '@/contexts/ToastContext';
import { useDarkModeStore } from '@/store/dark.store';

import Footer from './Footer';

const LayoutContent = () => {
  const isDarkMode = useDarkModeStore((state) => state.isDarkMode);
  const { toasts, removeToast } = useToastContext();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="h-dvh max-w-[var(--max-width)] mx-auto shadow-sm dark:shadow-white">
      <Outlet />
      <Footer />
      <ModalProvider />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

const Layout = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <LayoutContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default Layout;
