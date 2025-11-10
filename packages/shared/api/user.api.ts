import { SearchOption, User } from '@repo/types';

import http from './client';
import { toAppError } from '.';

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
