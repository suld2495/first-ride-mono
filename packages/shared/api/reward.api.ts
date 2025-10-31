import { Reward } from '@repo/types';

import http from './client';
import { toAppError } from '.';

// 보상 목록 조회
export const fetchRewards = async (): Promise<Reward[]> => {
  try {
    const response: Reward[] = await http.get('/quest/reward/list');

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};
