import {
  CompleteProfileRequest,
  CompleteProfileResponse,
  SocialLoginRequest,
  SocialLoginResponse,
} from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/auth';

export const socialLoginCheck = async ({
  provider,
  accessToken,
}: SocialLoginRequest): Promise<SocialLoginResponse> => {
  try {
    return await http.post(`${baseURL}/${provider}/check`, { accessToken });
  } catch (error) {
    throw toAppError(error);
  }
};

export const socialLogin = async ({
  provider,
  ...form
}: SocialLoginRequest): Promise<SocialLoginResponse> => {
  try {
    return await http.post(`${baseURL}/${provider}/login`, form);
  } catch (error) {
    throw toAppError(error);
  }
};

export const completeProfile = async (
  request: CompleteProfileRequest,
): Promise<CompleteProfileResponse> => {
  try {
    return await http.post(`${baseURL}/complete-profile`, request);
  } catch (error) {
    throw toAppError(error);
  }
};
