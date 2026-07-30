import type {
  RequestList,
  RequestResponseForm,
  RoutineDetail,
} from '@repo/types';
import type { AxiosProgressEvent } from 'axios';

import { toAppError } from '.';
import http from './client';

const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

export interface CreateRequestOptions {
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

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

export const createRequest = async (
  data: FormData,
  options: CreateRequestOptions = {},
): Promise<void> => {
  try {
    const response: void = await http.post(`/routine/confirm`, data, {
      timeout: IMAGE_UPLOAD_TIMEOUT_MS,
      onUploadProgress: options.onUploadProgress,
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
