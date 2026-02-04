'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getAuthorization } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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

  const navItems = [
    { href: '/', label: '대시보드', icon: '🏠' },
    { href: '/quests', label: '퀘스트', icon: '⚔️' },
    { href: '/rewards', label: '리워드', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b-2 border-[#0891b2] bg-[rgba(15,23,42,0.98)]">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0891b2] bg-[rgba(8,145,178,0.2)]">
                <span className="text-xl">🎮</span>
              </div>
              <span className="text-glow text-xl font-bold text-[#1ddeff]">
                First Ride Admin
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-[#0891b2] bg-[rgba(8,145,178,0.1)] px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0891b2] text-sm font-bold text-white">
                {user.nickname?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-[#e0f2fe]">
                {user.nickname}
              </span>
              <span className="quest-badge text-xs">ADMIN</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="border-[#ef4444] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
