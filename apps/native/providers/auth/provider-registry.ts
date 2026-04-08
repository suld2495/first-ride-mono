import { credentialsProvider } from './credentials.provider';
import { kakaoProvider } from './kakao.provider';
import type {
  AuthPayload,
  AuthProviderType,
  AuthResponse,
  DeviceInfo,
} from './types';

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

const providers: Partial<Record<AuthProviderType, RuntimeAuthProvider>> = {
  credentials: credentialsProvider as RuntimeAuthProvider,
  kakao: kakaoProvider as RuntimeAuthProvider,
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
    (provider): provider is RuntimeAuthProvider =>
      provider?.isAvailable() === true,
  );
}

export function getSocialProviders(): RuntimeAuthProvider[] {
  return getAvailableProviders().filter(
    (provider) => provider.type !== 'credentials',
  );
}
