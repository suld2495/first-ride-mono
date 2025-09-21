import { SearchOption } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addFriend, deleteFriend, fetchFriends } from '../api/friend';
import { friendKey } from '../types/query-keys/friend';

export const useFetchFriendsQuery = (option: SearchOption) => {
  return useQuery({
    queryKey: friendKey.list(option),
    queryFn: () => fetchFriends(option),
  });
};

export const useDeleteFriendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFriend,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: friendKey.all,
      });
    },
  });
};

export const useAddFriendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFriend,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: friendKey.all,
      });
    },
  });
};
