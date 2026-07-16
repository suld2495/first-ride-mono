import type { SearchOption, UpdateMottoRequest, User } from '@repo/types';

import axiosInstance, { toAppError } from '.';
import http from './client';

const baseURL = '/users';

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
    const response = await axiosInstance.put<User>(
      `${baseURL}/me/motto`,
      request,
    );

    return response.data;
  } catch (error) {
    throw toAppError(error);
  }
};
