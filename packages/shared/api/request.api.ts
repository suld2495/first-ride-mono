import { RequestList, RequestResponseForm, RoutineDetail } from '@repo/types';

import http from '.';

export const fetchReceivedRequests = async (
  nickname: string,
): Promise<RequestList> => {
  return http.get(`/routine/confirm/list?nickname=${nickname}`);
};

export const fetchRequestDetail = async (
  id: number,
): Promise<RoutineDetail> => {
  return http.get(`/routine/confirm/detail?id=${id}`);
};

export const createRequest = async (data: FormData): Promise<void> => {
  return http.post(`/routine/confirm`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const replyRequest = async (
  data: RequestResponseForm,
): Promise<void> => {
  return http.post('/routine/check', data, {
    method: 'POST',
  });
};
