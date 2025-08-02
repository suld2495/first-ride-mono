import { AuthForm, JoinForm, User } from '@repo/types';

import http from '.';

export const login = (form: AuthForm): Promise<User> => {
  return http.post(`/login`, form);
};

export const join = (form: JoinForm): Promise<void> => {
  return http.post(`/join`, form);
};
