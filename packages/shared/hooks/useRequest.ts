import type { CreateRequestResponseDto } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as requestApi from '../api/request.api';
import type { CreateRequestOptions } from '../api/request.api';
import { requestKey } from '../types/query-keys/request';
import { userKey } from '../types/query-keys/user';

interface CreateRequestMutationVariables extends CreateRequestOptions {
  data: FormData;
}

export const useFetchReceivedRequestsQuery = (nickname: string) => {
  return useQuery({
    queryKey: requestKey.receivedList(nickname),
    queryFn: () => requestApi.fetchReceivedRequests(),
    initialData: [],
    enabled: !!nickname,
  });
};

export const useFetchRequestDetailQuery = (confirmId: number) => {
  return useQuery({
    queryKey: requestKey.detail(confirmId),
    queryFn: () => requestApi.fetchRequestDetail(confirmId),
    enabled: confirmId > 0,
  });
};

export const useCreateRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, onUploadProgress }: CreateRequestMutationVariables) =>
      requestApi.createRequest(data, { onUploadProgress }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: requestKey.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: ['stat'],
        }),
        queryClient.invalidateQueries({
          queryKey: userKey.all(),
        }),
      ]);
    },
  });
};

export const useReplyRequestMutation = (user: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequestResponseDto) =>
      requestApi.replyRequest(data),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: requestKey.receivedList(user),
        }),
        queryClient.invalidateQueries({
          queryKey: ['stat'],
        }),
        queryClient.invalidateQueries({
          queryKey: userKey.all(),
        }),
      ]);
    },
  });
};
