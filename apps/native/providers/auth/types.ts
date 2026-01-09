import { Platform } from 'react-native';
import { User } from '@repo/types';

// Provider 타입
export type AuthProviderType =
  | 'credentials'
  | 'kakao'
  | 'apple'
  | 'google'
  | 'naver';
export type SocialProviderType = Exclude<AuthProviderType, 'credentials'>;

export const AUTH_PROVIDER_NAMES: Record<AuthProviderType, string> = {
  credentials: '아이디/비밀번호',
  kakao: '카카오',
  apple: 'Apple',
  google: 'Google',
  naver: '네이버',
};

// 인증 Payload
export interface CredentialsPayload {
  provider: 'credentials';
  userId: string;
  password: string;
}

export interface SocialPayload {
  provider: SocialProviderType;
  socialId: string;
  accessToken: string;
  idToken?: string;
}

export type AuthPayload = CredentialsPayload | SocialPayload;

// 디바이스 정보
export interface DeviceInfo {
  pushToken?: string;
  deviceType: 'ios' | 'android';
}

export function getDeviceType(): DeviceInfo['deviceType'] {
  return Platform.select({
    ios: 'ios' as const,
    android: 'android' as const,
    default: 'android' as const,
  });
}

// 인증 응답 (공통)
export interface AuthResponse {
  isNewUser: boolean;
  userInfo?: User;
  accessToken?: string;
  refreshToken?: string;
}

// Provider 인터페이스 - 각 Provider가 자신의 Payload 타입을 정의
export interface AuthProvider<
  TType extends AuthProviderType = AuthProviderType,
  TPayload extends AuthPayload = AuthPayload,
  TParams = unknown,
> {
  type: TType;
  name: string;
  isAvailable: () => boolean;
  authenticate: (params?: TParams) => Promise<TPayload>;
  callApi: (payload: TPayload, deviceInfo: DeviceInfo) => Promise<AuthResponse>;
  signOut?: () => Promise<void>;
}
