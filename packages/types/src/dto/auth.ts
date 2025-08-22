import { Auth, User } from '../models';

export type AuthForm = Pick<Auth, 'userId' | 'password'>;

export type JoinForm = Pick<Auth, 'userId' | 'nickname' | 'password' | 'job'>;

export type AuthResponse = {
  user: User;
  accessToken: string;
};
