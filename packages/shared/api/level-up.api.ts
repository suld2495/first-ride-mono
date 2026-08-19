import type { LevelUpStatusResponse } from '@repo/types';

import { toAppError } from '.';
import http from './client';

export const fetchLevelUpStatus = async (): Promise<LevelUpStatusResponse> => {
  try {
    return await http.get<LevelUpStatusResponse, void>(
      '/users/me/level-up-status',
    );
  } catch (error) {
    throw toAppError(error);
  }
};
