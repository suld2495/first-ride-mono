import type { SearchOption, User } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchMe, fetchUserList, updateMotto } from '../api/user.api';
import { userKey } from '../types/query-keys/user';

// eslint-disable-next-line no-magic-numbers -- 프로필은 5분간 fresh 상태로 재사용한다.
export const USER_PROFILE_STALE_TIME_MS = 5 * 60 * 1000;
// eslint-disable-next-line no-magic-numbers -- 재방문이 잔은 프로필을 30분간 캐시에 유지한다.
export const USER_PROFILE_GC_TIME_MS = 30 * 60 * 1000;

export const useFetchUserListQuery = (option: SearchOption) => {
  return useQuery({
    queryKey: userKey.list(option),
    queryFn: () => fetchUserList(option),
    enabled: !!option.keyword,
  });
};

export const useFetchMeQuery = (userId?: User['userId']) => {
  return useQuery({
    queryKey: userKey.me(userId ?? ''),
    queryFn: fetchMe,
    enabled: !!userId,
    staleTime: USER_PROFILE_STALE_TIME_MS,
    gcTime: USER_PROFILE_GC_TIME_MS,
  });
};

export const useUpdateMottoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMotto,
    onSuccess: (user) => {
      queryClient.setQueryData(userKey.me(user.userId), user);
    },
  });
};
