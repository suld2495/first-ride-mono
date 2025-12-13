import { useMutation } from '@tanstack/react-query';

import * as authApi from '../api/auth.api';

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => authApi.logout(),
  });
};
