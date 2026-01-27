'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getAuthorization } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthorization();

      if (!token || !user) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [user, router]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
