import type { TokenResponse } from './auth';

export type AppleGender = 'MALE' | 'FEMALE';

export interface AppleCredentialRequest {
  identityToken: string;
  authorizationCode?: string;
}

export interface AppleDeviceRequest {
  pushToken?: string;
  deviceType?: 'ios' | 'android';
  deviceId?: string;
}

export interface AppleUserInfo {
  appleId: string;
  email: string | null;
  nickname: string | null;
}

export type AppleCheckRequest = Pick<
  AppleCredentialRequest,
  'identityToken'
>;

export interface AppleCheckResponse {
  isNewUser: boolean;
  appleUserInfo: AppleUserInfo;
}

export type AppleLoginRequest = AppleCredentialRequest & AppleDeviceRequest;

export type AppleLoginResponse = TokenResponse;

export type AppleSignUpRequest = AppleCredentialRequest &
  AppleDeviceRequest & {
    nickname: string;
    job: string;
    gender: AppleGender;
  };

export type AppleSignUpResponse = TokenResponse;
