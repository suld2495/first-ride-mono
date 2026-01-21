import type {
  DistributeStatsRequest,
  DistributeStatsResponse,
  StatResponse,
} from '@repo/types';

import http from './client';
import { toAppError } from '.';

export const fetchMyStats = async (): Promise<StatResponse> => {
  try {
    const response: StatResponse = await http.get('/stats/me');
    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const distributeStats = async (
  request: DistributeStatsRequest,
): Promise<DistributeStatsResponse> => {
  try {
    const response: DistributeStatsResponse = await http.post(
      '/stats/distribute',
      request,
    );
    return response;
  } catch (error) {
    throw toAppError(error);
  }
};
