import { credentialsProvider } from './credentials.provider';
import { kakaoProvider } from './kakao.provider';
import {
  AuthPayload,
  AuthProviderType,
  AuthResponse,
  DeviceInfo,
} from './types';

export * from './types';
export * from './base/social.provider';
export type { CredentialsParams } from './credentials.provider';

// 런타임에서 사용할 Provider 인터페이스
export interface RuntimeAuthProvider {
  type: AuthProviderType;
  name: string;
  isAvailable: () => boolean;
  authenticate: (params?: unknown) => Promise<AuthPayload>;
  callApi: (
    payload: AuthPayload,
    deviceInfo: DeviceInfo,
  ) => Promise<AuthResponse>;
  signOut?: () => Promise<void>;
}

// 타입 단언을 통해 구체적인 Provider를 RuntimeAuthProvider로 변환
const providers: Partial<Record<AuthProviderType, RuntimeAuthProvider>> = {
  credentials: credentialsProvider as unknown as RuntimeAuthProvider,
  kakao: kakaoProvider as unknown as RuntimeAuthProvider,
};

export function getProvider(type: AuthProviderType): RuntimeAuthProvider {
  const provider = providers[type];
  if (!provider) {
    throw new Error(`Auth provider '${type}' is not available`);
  }
  return provider;
}

export function getAvailableProviders(): RuntimeAuthProvider[] {
  return Object.values(providers).filter(
    (p): p is RuntimeAuthProvider => p != null && p.isAvailable(),
  );
}

export function getSocialProviders(): RuntimeAuthProvider[] {
  return getAvailableProviders().filter((p) => p.type !== 'credentials');
}
