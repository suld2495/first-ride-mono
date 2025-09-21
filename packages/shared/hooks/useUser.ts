import { SearchOption } from '@repo/types';
import { useQuery } from '@tanstack/react-query';

import { fetchUserList } from '../api/user.api';
import { userKey } from '../types/query-keys/user';

export const useFetchUserListQuery = (option: SearchOption) => {
  return useQuery({
    queryKey: userKey.list(option),
    queryFn: () => fetchUserList(option),
    enabled: !!option.keyword,
  });
};
