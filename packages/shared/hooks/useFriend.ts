import type { FriendRequestResponse, SearchOption } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptFriendRequest,
  addFriend,
  deleteFriend,
  fetchFriendProfile,
  fetchFriendRoutines,
  fetchFriendRequests,
  fetchFriends,
  rejectFriendRequest,
} from '../api/friend';
import { friendKey, friendRequestKey } from '../types/query-keys/friend';

const removeFriendRequestFromCache = (
  requests: FriendRequestResponse[] | undefined,
  requestId: number,
) => {
  if (!requests) {
    return requests;
  }

  return requests.filter((request) => request.id !== requestId);
};

export const useFetchFriendsQuery = (
  option: SearchOption = { page: 1, keyword: '' },
) => {
  return useQuery({
    queryKey: friendKey.list(option),
    queryFn: () => fetchFriends(option),
    refetchOnMount: 'always',
  });
};

export const useFriendRoutinesQuery = (
  friendId: number | string | undefined,
  date: string,
) => {
  return useQuery({
    queryKey: friendKey.routines(friendId ?? '', date),
    queryFn: () => fetchFriendRoutines(friendId, date),
    enabled: !!friendId && !!date,
    refetchOnMount: 'always',
  });
};

export const useFriendProfileQuery = (
  friendId: number | string | undefined,
) => {
  return useQuery({
    queryKey: friendKey.profile(friendId ?? ''),
    queryFn: () => fetchFriendProfile(friendId),
    enabled: !!friendId,
    refetchOnMount: 'always',
  });
};

export const useDeleteFriendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFriend,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: friendKey.all(),
      });
    },
  });
};

export const useAddFriendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFriend,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: friendKey.all(),
      });
    },
  });
};

export const useFetchFriendRequestsQuery = (page: number) => {
  return useQuery({
    queryKey: friendRequestKey.list(page),
    queryFn: () => fetchFriendRequests(page),

    select(requests) {
      return requests.map((request) => ({
        ...request,
        createdAt: new Date(request.createdAt),
      }));
    },
  });
};

export const useAcceptFriendRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptFriendRequest,

    onSuccess: async (_, requestId) => {
      queryClient.setQueriesData<FriendRequestResponse[]>(
        {
          queryKey: friendRequestKey.all(),
        },
        (requests) => removeFriendRequestFromCache(requests, requestId),
      );
      await queryClient.invalidateQueries({
        queryKey: friendRequestKey.all(),
      });
      await queryClient.invalidateQueries({
        queryKey: friendKey.all(),
      });
    },
  });
};

export const useRejectFriendRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectFriendRequest,

    onSuccess: async (_, requestId) => {
      queryClient.setQueriesData<FriendRequestResponse[]>(
        {
          queryKey: friendRequestKey.all(),
        },
        (requests) => removeFriendRequestFromCache(requests, requestId),
      );
      await queryClient.invalidateQueries({
        queryKey: friendRequestKey.all(),
      });
    },
  });
};
