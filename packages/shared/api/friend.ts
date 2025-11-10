import { Friend, FriendRequestResponse, SearchOption, User } from '@repo/types';

import http from './client';
import { toAppError } from '.';

const baseURL = '/friends';

export const fetchFriends = async ({
  keyword = '',
}: SearchOption): Promise<Friend[]> => {
  try {
    const response: Friend[] = await http.get(
      `${baseURL}?${keyword ? `nickname=${keyword}` : ''}`,
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

export const addFriend = async (
  friendNickname: User['nickname'],
): Promise<FriendRequestResponse> => {
  try {
    return await http.post(`${baseURL}/requests`, {
      receiverNickname: friendNickname,
    });
  } catch (error) {
    throw toAppError(error);
  }
};

export const acceptFriendRequest = async (requestId: number): Promise<void> => {
  try {
    await http.post(`${baseURL}/requests/${requestId}/accept`);
  } catch (error) {
    throw toAppError(error);
  }
};

export const rejectFriendRequest = async (requestId: number): Promise<void> => {
  try {
    await http.post(`${baseURL}/requests/${requestId}/reject`);
  } catch (error) {
    throw toAppError(error);
  }
};

export const deleteFriend = async (
  friendNickname: User['nickname'],
): Promise<void> => {
  try {
    await http.delete(`${baseURL}/${friendNickname}`);
  } catch (error) {
    throw toAppError(error);
  }
};
