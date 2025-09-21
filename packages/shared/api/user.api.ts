import { SearchOption, User } from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/user';

export const fetchUserList = async ({
  page = 1,
  keyword = '',
}: SearchOption): Promise<User[]> => {
  try {
    const response: User[] = await http.get(
      `${baseURL}?page=${page}${keyword ? `keyword=${keyword}` : ''}`,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};
