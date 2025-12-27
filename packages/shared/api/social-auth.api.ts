import {
  CompleteProfileRequest,
  CompleteProfileResponse,
  SocialLoginRequest,
  SocialLoginResponse,
} from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/auth';

export const socialLogin = async (
  request: SocialLoginRequest,
): Promise<SocialLoginResponse> => {
  try {
    return await http.post(`${baseURL}/social/login`, request);
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
