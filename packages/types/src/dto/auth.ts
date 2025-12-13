import { Auth, User } from '../models';

export type AuthForm = Pick<Auth, 'userId' | 'password'> & {
  pushToken?: string;
  deviceType?: 'ios' | 'android';
};

export type JoinForm = Pick<Auth, 'userId' | 'nickname' | 'password' | 'job'>;

// 토큰 응답 공통 타입
export type TokenResponse = {
  userInfo: User;
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = TokenResponse;

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = TokenResponse;

export type LogoutResponse = {
  message: string;
};
