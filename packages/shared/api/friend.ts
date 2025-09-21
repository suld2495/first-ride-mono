import { Friend, SearchOption, User } from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/friend';

export const fetchFriends = async ({
  page = 1,
  keyword = '',
}: SearchOption): Promise<Friend[]> => {
  try {
    const response: Friend[] = await http.get(
      `${baseURL}?page=${page}${keyword ? `keyword=${keyword}` : ''}`,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const addFriend = async (friendId: User['userId']): Promise<void> => {
  try {
    await http.post(`${baseURL}/${friendId}`);
  } catch (error) {
    throw toAppError(error);
  }
};

export const deleteFriend = async (friendId: User['userId']): Promise<void> => {
  try {
    await http.delete(`${baseURL}/${friendId}`);
  } catch (error) {
    throw toAppError(error);
  }
};
