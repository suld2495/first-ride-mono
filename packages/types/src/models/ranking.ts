import type { StatKey } from './stat';

export interface LevelRankingEntry {
  userId: number;
  nickname: string;
  level: number;
  totalExp: number;
  rank?: number;
  createdAt?: string;
  job?: string;
  characterCode?: string;
  isMe?: boolean;
}

export interface StatRankingEntry {
  userId: number;
  nickname: string;
  statType: StatKey;
  value: number;
  rank?: number;
  level?: number;
  job?: string;
  characterCode?: string;
  isMe?: boolean;
}

export type AllStatRankingResponse = Partial<Record<StatKey, StatRankingEntry[]>>;
