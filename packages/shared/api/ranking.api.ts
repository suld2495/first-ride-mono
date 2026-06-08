import type {
  AllStatRankingResponse,
  LevelRankingEntry,
  StatKey,
  StatRankingEntry,
} from '@repo/types';

import { toAppError } from '.';
import http from './client';

export const fetchAllLevelRanking = async (
  topN = 50,
): Promise<LevelRankingEntry[]> => {
  try {
    return await http.get('/ranking/level/all', {
      params: { topN },
    });
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchFriendLevelRanking = async (): Promise<
  LevelRankingEntry[]
> => {
  try {
    return await http.get('/ranking/level/friends');
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchStatRanking = async (
  statType: StatKey,
  topN = 10,
): Promise<StatRankingEntry[]> => {
  try {
    return await http.get(`/stats/ranking/${statType}`, {
      params: { topN },
    });
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchAllStatRankings = async (
  topN = 10,
): Promise<AllStatRankingResponse> => {
  try {
    return await http.get('/stats/ranking', {
      params: { topN },
    });
  } catch (error) {
    throw toAppError(error);
  }
};
