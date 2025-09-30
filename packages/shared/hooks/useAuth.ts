import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { join, login } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export const useLoginMutation = () => {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: login,

    onSuccess: (response) => {
      authStore.signIn(response.userInfo);
      return response.accessToken;
    },

    onError: (error: AxiosError) => {
      if (error.status === 400) {
        alert('아이디 또는 비밀번호를 확인해주세요.');
      }
    },
  });
};

export const useJoinMutation = () => {
  return useMutation({
    mutationFn: join,

    onError: (error: AxiosError) => {
      if (error.status !== 400) {
        alert('문제가 발생했습니다. 잠시 후 다시 이용해주시기 바랍니다.');
        return;
      }

      if (error.response?.data === '아이디 중복') {
        alert('중복된 아이디입니다.');
      }
    },
  });
};
