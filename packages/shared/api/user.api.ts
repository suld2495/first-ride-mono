import type { SearchOption, User } from '@repo/types';

import { toAppError } from '.';
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
