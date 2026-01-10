import {
  SocialLoginRequest,
  SocialLoginResponse,
  SocialSignUpRequest,
  SocialSignUpResponse,
} from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/auth';

export const socialLoginCheck = async ({
  provider,
  accessToken,
}: SocialLoginRequest): Promise<
  Pick<SocialLoginResponse, 'isNewUser' | 'kakaoUserInfo'>
> => {
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

export const socialSignUp = async (
  request: SocialSignUpRequest,
): Promise<SocialSignUpResponse> => {
  try {
    return await http.post(`${baseURL}/${request.provider}/signup`, request);
  } catch (error) {
    throw toAppError(error);
  }
};
