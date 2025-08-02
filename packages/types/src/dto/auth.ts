import { Auth, User } from 'src/models';

export type AuthForm = Pick<Auth, 'email' | 'password'>;

export type JoinForm = Omit<Auth, ''>;

export type AuthResponse = {
  user: User;
  token: string;
};
