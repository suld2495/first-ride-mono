import { User } from '../models';

import { AuthForm, TokenResponse } from './auth';

export type SocialProvider = 'kakao' | 'apple' | 'google' | 'naver';

export interface SocialLoginRequest {
  provider: SocialProvider;
  accessToken: string;
  pushToken?: AuthForm['pushToken'];
  deviceType?: AuthForm['deviceType'];
}

export interface SocialLoginResponse {
  isNewUser: boolean;
  kakaoUserInfo?: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface SocialSignUpRequest {
  provider: SocialProvider;
  accessToken: string;
  nickname: string;
  job: string;
  pushToken?: string;
  deviceType?: 'ios' | 'android';
}

export type SocialSignUpResponse = TokenResponse;
