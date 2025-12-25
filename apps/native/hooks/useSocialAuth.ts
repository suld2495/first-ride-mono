import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

import { setAuthorization, setRefreshToken } from '@/api';
import {
  AuthProviderType,
  DeviceInfo,
  getProvider,
} from '@/providers/auth';
import { useAuthStore } from '@/store/auth.store';

import { useNotifications } from './useNotifications';

type SocialProviderType = Exclude<AuthProviderType, 'credentials'>;

interface UseSocialAuthReturn {
  login: <T extends SocialProviderType>(providerType: T) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useSocialAuth(): UseSocialAuthReturn {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const { pushToken } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async <T extends SocialProviderType>(providerType: T) => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = getProvider(providerType);

      const deviceInfo: DeviceInfo = {
        pushToken: pushToken?.data,
        deviceType: Platform.OS as 'ios' | 'android',
      };

      // 1. Provider에서 인증 정보 획득
      const payload = await provider.authenticate();

      // 2. Provider가 자신의 API 호출
      const response = await provider.callApi(payload, deviceInfo);

      // 3. 결과 처리
      if (response.isNewUser) {
        // 신규 회원: 추가 정보 입력 화면으로
        router.push({
          pathname: '/complete-profile',
          params: {
            tempToken: response.tempToken,
            provider: providerType,
          },
        });
      } else {
        // 기존 회원: 로그인 완료
        signIn(response.userInfo!);
        await Promise.all([
          setAuthorization(response.accessToken!),
          setRefreshToken(response.refreshToken!),
        ]);
        router.push('/(tabs)/(afterLogin)/(routine)');
      }
    } catch (err) {
      const authError =
        err instanceof Error ? err : new Error('로그인에 실패했습니다.');
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}

// Provider 타입에 따른 로그아웃
export async function socialLogout(
  providerType?: AuthProviderType,
): Promise<void> {
  if (providerType && providerType !== 'credentials') {
    const provider = getProvider(providerType);
    await provider.signOut?.();
  }
}
