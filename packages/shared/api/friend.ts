import type {
  Friend,
  FriendCheerResponse,
  FriendProfileResponse,
  FriendRoutinesResponse,
  FriendRequestResponse,
  Routine,
  SearchOption,
  User,
} from '@repo/types';
import type { AxiosResponse } from 'axios';

import axiosInstance, { toAppError } from '.';
import http from './client';

const baseURL = '/friends';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const getNullableString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const getNumber = (value: unknown, fallback = 0): number => {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const getFriendId = (value: unknown, index: number): Friend['friendId'] => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return `unknown-${index}`;
};

const normalizeFriend = (value: unknown, index: number): Friend => {
  const friend = isRecord(value) ? value : {};
  const motto = getNullableString(friend.motto);
  const mottos = Array.isArray(friend.mottos)
    ? friend.mottos.filter(
        (mottoValue): mottoValue is string => typeof mottoValue === 'string',
      )
    : motto
      ? [motto]
      : [];

  return {
    backgroundImageUrl: getNullableString(friend.backgroundImageUrl),
    friendId: getFriendId(friend.friendId, index),
    userId: getString(friend.userId),
    nickname: getString(friend.nickname, `친구 ${index + 1}`),
    motto,
    mottos,
    mateNickname: getNullableString(friend.mateNickname),
    job: getString(friend.job),
    profileImage: getNullableString(friend.profileImage),
    level: Math.max(1, Math.floor(getNumber(friend.level, 1))),
    characterCode: getString(friend.characterCode),
    characterImageUrl: getNullableString(friend.characterImageUrl),
    friendSince: getString(friend.friendSince),
  };
};

const filterFriendsByKeyword = (
  friends: Friend[],
  keyword: SearchOption['keyword'],
): Friend[] => {
  const normalizedKeyword =
    typeof keyword === 'string' ? keyword.trim().toLocaleLowerCase() : '';

  if (!normalizedKeyword) {
    return friends;
  }

  return friends.filter(
    ({ nickname }) =>
      nickname.toLocaleLowerCase().indexOf(normalizedKeyword) !== -1,
  );
};

export const fetchFriends = async ({
  keyword = '',
}: SearchOption): Promise<Friend[]> => {
  try {
    const response: unknown = await http.get(baseURL);
    const friends = Array.isArray(response)
      ? response.map(normalizeFriend)
      : [];

    return filterFriendsByKeyword(friends, keyword);
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

export const fetchFriendProfile = async (
  friendId: Friend['friendId'],
): Promise<FriendProfileResponse> => {
  try {
    return await http.get(
      `${baseURL}/${encodeURIComponent(String(friendId))}/profile`,
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const sendFriendCheer = async (
  friendId: Friend['friendId'],
): Promise<FriendCheerResponse> => {
  try {
    const response = await axiosInstance.post<
      FriendCheerResponse | { data: FriendCheerResponse }
    >(`${baseURL}/${encodeURIComponent(String(friendId))}/cheer`);
    const body = response.data;

    return 'data' in body ? body.data : body;
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

const toFriendRoutine = (
  routine: FriendRoutinesResponse['routines'][number],
  friend: FriendRoutinesResponse['friend'],
): Routine => ({
  routineId: routine.routineId,
  nickname: friend.nickname,
  routineName: routine.routineName,
  routineDetail: routine.routineDetail,
  penalty: routine.penalty,
  weeklyCount: routine.weeklyCount,
  routineCount: routine.routineCount,
  mateNickname: routine.mateNickname,
  isMe: false,
  startDate: routine.startDate,
  endDate: routine.endDate ?? undefined,
  successDate: routine.successDate ?? [],
  paused: routine.paused,
  hidden: routine.hidden,
  hasPendingConfirmation: false,
  pendingConfirmationCount: 0,
  pendingConfirmationIds: [],
});

const unwrapFriendRoutinesResponse = (
  response: AxiosResponse<
    FriendRoutinesResponse | { data: FriendRoutinesResponse }
  >,
): FriendRoutinesResponse => {
  const body = response.data;

  return 'data' in body ? body.data : body;
};

export const fetchFriendRoutines = async (
  friendId: Friend['friendId'],
  date: string,
): Promise<{
  friend: FriendRoutinesResponse['friend'];
  routines: Routine[];
}> => {
  try {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const response = await axiosInstance.get<
      FriendRoutinesResponse | { data: FriendRoutinesResponse }
    >(`${baseURL}/${encodeURIComponent(String(friendId))}/routines${query}`);
    const friendRoutines = unwrapFriendRoutinesResponse(response);
    const routines = friendRoutines.routines.map((routine) =>
      toFriendRoutine(routine, friendRoutines.friend),
    );

    return {
      friend: friendRoutines.friend,
      routines,
    };
  } catch (error) {
    throw toAppError(error);
  }
};
