import type { StatKey, StatResponse } from '../models/stat';

export interface DistributeStatsRequest {
  distributions: Partial<Record<StatKey, number>>;
}

export type DistributeStatsResponse = StatResponse;
