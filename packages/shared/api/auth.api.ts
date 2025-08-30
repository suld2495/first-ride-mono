import { AuthForm, AuthResponse, JoinForm } from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/auth';

export const login = async (form: AuthForm): Promise<AuthResponse> => {
  try {
    const response: AuthResponse = await http.post(`${baseURL}/login`, form);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const join = async (form: JoinForm): Promise<void> => {
  try {
    const response: void = await http.post(`${baseURL}/signup`, form);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};
