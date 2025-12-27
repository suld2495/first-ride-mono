import { useState } from 'react';
import { Platform } from 'react-native';
import { join } from '@repo/shared/api';
import { completeProfile } from '@repo/shared/api/social-auth.api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';

import { setAuthorization, setRefreshToken } from '@/api';
import {
  type AuthProviderType,
  type CredentialsParams,
  type SocialProviderType,
} from '@/providers/auth';
import { authManager } from '@/providers/auth/auth-manager';
import { useAuthStore } from '@/store/auth.store';

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
  const { signIn, signOut: authSignOut } = useAuthStore();
  const { pushToken } = useNotifications();
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderType | null>(null);
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
        deviceType: Platform.OS as 'ios' | 'android',
      };

      const result = await authManager.login(providerType, deviceInfo, params);

      if (result.isNewUser) {
        // 신규 회원: 추가 정보 입력 화면으로
        router.push({
          pathname: '/complete-profile',
          params: {
            tempToken: result.tempToken,
            provider: providerType,
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
  return useMutation({
    mutationFn: join,

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

export const useCompleteProfileMutation = () => {
  return useMutation({
    mutationFn: completeProfile,
  });
};
