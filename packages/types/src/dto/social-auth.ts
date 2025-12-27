import { User } from '../models';
import { TokenResponse } from './auth';

export type SocialProvider = 'kakao' | 'apple' | 'google' | 'naver';

export interface SocialLoginRequest {
  provider: SocialProvider;
  socialId: string;
  accessToken: string;
  idToken?: string;
  pushToken?: string;
  deviceType?: 'ios' | 'android';
}

export interface SocialLoginResponse {
  isNewUser: boolean;
  userInfo?: User;
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
}

export interface CompleteProfileRequest {
  tempToken: string;
  nickname: string;
  job: string;
  pushToken?: string;
  deviceType?: 'ios' | 'android';
}

export type CompleteProfileResponse = TokenResponse;
