import type {
  AppleCheckRequest,
  AppleCheckResponse,
  AppleLoginRequest,
  AppleLoginResponse,
  AppleSignUpRequest,
  AppleSignUpResponse,
} from '@repo/types';

import { toAppError } from '.';
import http from './client';

const baseURL = '/auth/apple';

export const appleCheck = async (
  request: AppleCheckRequest,
): Promise<AppleCheckResponse> => {
  try {
    return await http.post(`${baseURL}/check`, request);
  } catch (error) {
    throw toAppError(error);
  }
};

export const appleLogin = async (
  request: AppleLoginRequest,
): Promise<AppleLoginResponse> => {
  try {
    return await http.post(`${baseURL}/login`, request);
  } catch (error) {
    throw toAppError(error);
  }
};

export const appleSignUp = async (
  request: AppleSignUpRequest,
): Promise<AppleSignUpResponse> => {
  try {
    return await http.post(`${baseURL}/signup`, request);
  } catch (error) {
    throw toAppError(error);
  }
};
