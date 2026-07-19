'use client';

import { HttpError } from '@repo/shared/api';
import { login } from '@repo/shared/api/auth.api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setAuthorization, setRefreshToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const TOO_MANY_REQUESTS_STATUS = 429;
const LOGIN_RATE_LIMIT_COOLDOWN_MS = 30_000;

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    if (!isRateLimited) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsRateLimited(false);
    }, LOGIN_RATE_LIMIT_COOLDOWN_MS);

    return () => clearTimeout(timeoutId);
  }, [isRateLimited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRateLimited) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await login({ userId, password });

      if (response.userInfo.role !== 'ADMIN') {
        setError('관리자 권한이 없습니다');
        setIsLoading(false);
        return;
      }

      setAuthorization(response.accessToken);
      setRefreshToken(response.refreshToken);
      signIn(response.userInfo);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof HttpError && err.status === TOO_MANY_REQUESTS_STATUS) {
        setIsRateLimited(true);
      }

      const message =
        err instanceof Error ? err.message : '로그인에 실패했습니다';

      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-[rgba(8,145,178,0.1)] blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-[rgba(251,191,36,0.1)] blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="quest-card space-y-8 p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-[#0891b2] bg-[rgba(8,145,178,0.2)]">
              <span className="text-3xl">🎮</span>
            </div>
            <h1 className="text-glow text-2xl font-bold text-[#1ddeff]">
              First Ride Admin
            </h1>
            <p className="mt-2 text-[#90a1b9]">관리자 계정으로 로그인하세요</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-[#e0f2fe]">
                아이디
              </Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                disabled={isLoading || isRateLimited}
                placeholder="아이디를 입력하세요"
                className="border-[#0891b2] bg-[rgba(15,23,42,0.8)] text-[#e0f2fe] placeholder:text-[#90a1b9] focus:border-[#1ddeff] focus:ring-[#1ddeff]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#e0f2fe]">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isRateLimited}
                placeholder="비밀번호를 입력하세요"
                className="border-[#0891b2] bg-[rgba(15,23,42,0.8)] text-[#e0f2fe] placeholder:text-[#90a1b9] focus:border-[#1ddeff] focus:ring-[#1ddeff]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#ef4444] bg-[rgba(239,68,68,0.1)] p-3">
                <span>⚠️</span>
                <p className="text-sm text-[#ef4444]">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="btn-quest w-full"
              disabled={isLoading || isRateLimited}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>로그인 중...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🔐</span>
                  <span>로그인</span>
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-[#90a1b9]">
              관리자 계정이 필요하신가요?{' '}
              <span className="text-[#0891b2]">
                시스템 관리자에게 문의하세요
              </span>
            </p>
          </div>
        </div>

        {/* Version Info */}
        <p className="mt-4 text-center text-xs text-[#90a1b9]">
          First Ride Admin v1.0.0
        </p>
      </div>
    </div>
  );
}
