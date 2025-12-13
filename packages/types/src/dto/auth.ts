import { Auth, User } from '../models';

export type AuthForm = Pick<Auth, 'userId' | 'password'> & {
  pushToken?: string;
  deviceType?: 'ios' | 'android';
};

export type JoinForm = Pick<Auth, 'userId' | 'nickname' | 'password' | 'job'>;

export type AuthResponse = {
  userInfo: User;
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  userInfo: User;
  accessToken: string;
  refreshToken: string;
};

export type LogoutResponse = {
  message: string;
};
