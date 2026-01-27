'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { getAuthorization } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthorization();
      if (!token || !user) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">Admin Dashboard</Link>
            <Link href="/quests" className="text-gray-600 hover:text-gray-900">퀘스트</Link>
            <Link href="/rewards" className="text-gray-600 hover:text-gray-900">리워드</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.nickname}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>로그아웃</Button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
