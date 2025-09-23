import { Friend, FriendRequestResponse, SearchOption, User } from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/friends';

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

export const fetchFriendRequests = async (
  page: number,
): Promise<FriendRequestResponse[]> => {
  try {
    const response: FriendRequestResponse[] = await http.get(
      `${baseURL}/requests?page=${page}`,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const addFriend = async (friendId: User['userId']): Promise<void> => {
  try {
    await http.post(`${baseURL}/requests/${friendId}`);
  } catch (error) {
    throw toAppError(error);
  }
};

export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    await http.post(`${baseURL}/requests/${requestId}/accept`);
  } catch (error) {
    throw toAppError(error);
  }
};

export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  try {
    await http.post(`${baseURL}/requests/${requestId}/reject`);
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
