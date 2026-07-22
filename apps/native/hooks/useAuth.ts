import { appleSignUp, fetchJobOptions, join } from '@repo/shared/api';
import { socialSignUp } from '@repo/shared/api/social-auth.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { setAuthorization, setRefreshToken } from '@/api/token-storage.api';
import { useAuthSignIn, useAuthSignOut } from '@/hooks/useAuthSession';
import { authManager } from '@/providers/auth/auth-manager';
import type { CredentialsParams } from '@/providers/auth/credentials.provider';
import {
  getDeviceType,
  type AuthProviderType,
  type SocialProviderType,
} from '@/providers/auth/types';
import { usePendingSocialAuthStore } from '@/store/pending-apple-auth.store';
import { getDeviceId } from '@/utils/device-id';

import { useNotifications } from './useNotifications';

const authQueryKeys = {
  join: () => ['auth', 'join'] as const,
  jobOptions: () => ['auth', 'job-options'] as const,
  socialSignUp: () => ['auth', 'social-sign-up'] as const,
  appleSignUp: () => ['auth', 'apple-sign-up'] as const,
};

interface UseAuthReturn {
  login: {
    (providerType: 'credentials', params: CredentialsParams): Promise<void>;
    (providerType: SocialProviderType): Promise<void>;
  };
  logout: (providerType?: AuthProviderType) => Promise<void>;
  loadingProvider: AuthProviderType | null;
  error: Error | null;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const signIn = useAuthSignIn();
  const authSignOut = useAuthSignOut();
  const { pushToken } = useNotifications();
  const [loadingProvider, setLoadingProvider] =
    useState<AuthProviderType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const loginAttemptSequence = useRef(0);
  const beginPendingAuthAttempt = usePendingSocialAuthStore(
    (state) => state.beginAttempt,
  );
  const clearPendingAuthAttempt = usePendingSocialAuthStore(
    (state) => state.clearAttempt,
  );

  const login = async (
    providerType: AuthProviderType,
    params?: CredentialsParams,
  ) => {
    const loginAttemptId = ++loginAttemptSequence.current;

    setLoadingProvider(providerType);
    setError(null);
    clearPendingAuthAttempt();

    try {
      const deviceId = await getDeviceId();
      const deviceInfo = {
        pushToken: pushToken?.data || undefined,
        deviceType: getDeviceType(),
        deviceId,
      };

      const result = await authManager.login(providerType, deviceInfo, params);

      if (loginAttemptSequence.current !== loginAttemptId) {
        return;
      }

      if (result.isNewUser) {
        if (!result.pendingCredential) {
          throw new Error('소셜 인증 정보를 저장하지 못했습니다.');
        }

        beginPendingAuthAttempt(result.pendingCredential);
        router.push('/social-sign-up');
      } else {
        // 기존 회원: 로그인 완료
        await Promise.all([
          setAuthorization(result.accessToken!),
          setRefreshToken(result.refreshToken!),
        ]);
        signIn(result.userInfo!);
      }
    } catch (err) {
      if (loginAttemptSequence.current !== loginAttemptId) {
        return;
      }

      clearPendingAuthAttempt();
      const authError =
        err instanceof Error ? err : new Error('로그인에 실패했습니다.');

      setError(authError);
      throw authError;
    } finally {
      if (loginAttemptSequence.current === loginAttemptId) {
        setLoadingProvider(null);
      }
    }
  };

  const logout = async (providerType?: AuthProviderType) => {
    loginAttemptSequence.current += 1;
    clearPendingAuthAttempt();
    await authManager.logout(providerType);
    await authSignOut();
  };

  return {
    login: login as UseAuthReturn['login'],
    logout,
    loadingProvider,
    error,
  };
}

export const useJoinMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: join,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.join(), true);
    },

    onError: (error: AxiosError) => {
      if (error.status !== 400) {
        alert('문제가 발생했습니다. 잠시 후 다시 이용해주시기 바랍니다.');
        return;
      }

      if (error.response?.data === '아이디 중복') {
        alert('중복된 아이디입니다.');
      }
    },
  });
};

export const useJobOptionsQuery = () =>
  useQuery({
    queryKey: authQueryKeys.jobOptions(),
    queryFn: fetchJobOptions,
    staleTime: 1000 * 60 * 60 * 24,
  });

export const useSocialSignUpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: socialSignUp,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.socialSignUp(), true);
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.socialSignUp(),
      });
    },
  });
};

export const useAppleSignUpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appleSignUp,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.appleSignUp(), true);
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.appleSignUp(),
      });
    },
  });
};
