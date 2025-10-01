import { SearchOption, User } from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/users';

export const fetchUserList = async ({
  page = 1,
  keyword = '',
}: SearchOption): Promise<User[]> => {
  try {
    const response: User[] = await http.get(
      `${baseURL}/search?page=${page}${keyword ? `&q=${keyword}` : ''}`,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};
