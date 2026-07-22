import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as authApi from '../api/auth.api';
import { authKey } from '../types/query-keys/auth';
import { userKey } from '../types/query-keys/user';

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKey.session(), null);
    },
  });
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => {
      queryClient.setQueryData(authKey.session(), null);
      queryClient.removeQueries({ queryKey: userKey.all() });
    },
  });
};
