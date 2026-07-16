import type { SearchOption } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchMe, fetchUserList, updateMotto } from '../api/user.api';
import { userKey } from '../types/query-keys/user';

export const useFetchUserListQuery = (option: SearchOption) => {
  return useQuery({
    queryKey: userKey.list(option),
    queryFn: () => fetchUserList(option),
    enabled: !!option.keyword,
  });
};

export const useFetchMeQuery = () => {
  return useQuery({
    queryKey: userKey.me(),
    queryFn: fetchMe,
  });
};

export const useUpdateMottoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMotto,
    onSuccess: async (user) => {
      queryClient.setQueryData(userKey.me(), user);

      try {
        await queryClient.invalidateQueries({
          queryKey: userKey.me(),
        });
      } catch {
        // 캐시 무효화 실패는 저장 결과를 되돌리지 않는다.
      }
    },
  });
};
