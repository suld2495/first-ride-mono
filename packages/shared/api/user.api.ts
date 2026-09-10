import type {
  ApplyFriendCodeRequest,
  ApplyFriendCodeResponse,
  FriendCodeStatusResponse,
  SearchOption,
  UpdateMottoRequest,
  User,
} from '@repo/types';

import { toAppError } from './http-client';
import http from './client';

const baseURL = '/users';
const friendCodeURL = `${baseURL}/me/friend-code`;

export const fetchUserList = async ({
  keyword = '',
}: SearchOption): Promise<User[]> => {
  try {
    const response: User[] = await http.get(
      `${baseURL}/search?${keyword ? `nickname=${keyword}` : ''}`,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchMe = async (): Promise<User> => {
  try {
    const response: User = await http.get(`${baseURL}/me`);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateMotto = async (
  request: UpdateMottoRequest,
): Promise<User> => {
  try {
    return await http.put<User, UpdateMottoRequest>(
      `${baseURL}/me/motto`,
      request,
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchFriendCodeStatus =
  async (): Promise<FriendCodeStatusResponse> => {
    try {
      return await http.get<FriendCodeStatusResponse, void>(friendCodeURL);
    } catch (error) {
      throw toAppError(error);
    }
  };

export const applyFriendCode = async (
  request: ApplyFriendCodeRequest,
): Promise<ApplyFriendCodeResponse> => {
  try {
    return await http.post<ApplyFriendCodeResponse, ApplyFriendCodeRequest>(
      friendCodeURL,
      request,
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const skipFriendCode = async (): Promise<FriendCodeStatusResponse> => {
  try {
    return await http.post<FriendCodeStatusResponse, undefined>(
      `${friendCodeURL}/skip`,
    );
  } catch (error) {
    throw toAppError(error);
  }
};
