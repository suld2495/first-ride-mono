import { Outlet } from 'react-router';

import ModalProvider from '@/components/providers/ModalProvider';

import Footer from './Footer';

const Layout = () => {
  return (
    <div className="h-dvh max-w-[var(--max-width)] mx-auto shadow-sm dark:shadow-white">
      <Outlet />
      <Footer />
      <ModalProvider />
    </div>
  );
};

export default Layout;
