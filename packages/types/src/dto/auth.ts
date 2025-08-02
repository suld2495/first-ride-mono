import { Auth } from 'src/models';

export type AuthForm = Pick<Auth, 'email' | 'password'>;

export type JoinForm = Omit<Auth, ''>;
