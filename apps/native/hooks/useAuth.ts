import { join } from '@repo/shared/api';
import { socialSignUp } from '@repo/shared/api/social-auth.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { setAuthorization, setRefreshToken } from '@/api/token-storage.api';
import { useAuthSignIn, useAuthSignOut } from '@/hooks/useAuthSession';
import { authManager } from '@/providers/auth/auth-manager';
import type { CredentialsParams } from '@/providers/auth/credentials.provider';
import {
  getDeviceType,
  type AuthProviderType,
  type SocialProviderType,
} from '@/providers/auth/types';

import { useNotifications } from './useNotifications';

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

  const login = async (
    providerType: AuthProviderType,
    params?: CredentialsParams,
  ) => {
    setLoadingProvider(providerType);
    setError(null);

    try {
      const deviceInfo = {
        pushToken: pushToken?.data,
        deviceType: getDeviceType(),
      };

      const result = await authManager.login(providerType, deviceInfo, params);

      if (result.isNewUser) {
        // 신규 회원: 추가 정보 입력 화면으로
        router.push({
          pathname: '/social-sign-up',
          params: {
            provider: providerType,
            accessToken: result.accessToken,
          },
        });
      } else {
        // 기존 회원: 로그인 완료
        signIn(result.userInfo!);
        await Promise.all([
          setAuthorization(result.accessToken!),
          setRefreshToken(result.refreshToken!),
        ]);
        router.push('/(tabs)/(afterLogin)/(routine)');
      }
    } catch (err) {
      const authError =
        err instanceof Error ? err : new Error('로그인에 실패했습니다.');

      setError(authError);
      throw authError;
    } finally {
      setLoadingProvider(null);
    }
  };

  const logout = async (providerType?: AuthProviderType) => {
    await authManager.logout(providerType);
    authSignOut();
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
  const authQueryKeys = {
    join: () => ['auth', 'join'],
    socialSignUp: () => ['auth', 'social-sign-up'],
  } as const;

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

export const useSocialSignUpMutation = () => {
  const queryClient = useQueryClient();
  const authQueryKeys = {
    socialSignUp: () => ['auth', 'social-sign-up'],
  } as const;

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
