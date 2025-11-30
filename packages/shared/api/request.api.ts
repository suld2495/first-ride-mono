import { RequestList, RequestResponseForm, RoutineDetail } from '@repo/types';

import http from './client';
import { toAppError } from '.';

export const fetchReceivedRequests = async (): Promise<RequestList> => {
  try {
    const response: RequestList = await http.get(`/routine/confirm/list`);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchRequestDetail = async (
  id: number,
): Promise<RoutineDetail> => {
  try {
    const response: RoutineDetail = await http.get(
      `/routine/confirm/detail?id=${id}`,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const createRequest = async (data: FormData): Promise<void> => {
  try {
    const response: void = await http.post(`/routine/confirm`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const replyRequest = async (
  data: RequestResponseForm,
): Promise<void> => {
  try {
    const response: void = await http.post('/routine/check', data);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};
