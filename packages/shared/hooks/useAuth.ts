import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as authApi from '../api/auth.api';
import { authKey } from '../types/query-keys/auth';

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKey.session(), null);
    },
  });
};
