import type { StatKey } from '@repo/types';

export const STAT_LABEL_BY_TYPE: Record<StatKey, string> = {
  STRENGTH: '힘',
  AGILITY: '민첩',
  INTELLIGENCE: '지능',
  LUCK: '행운',
  VITALITY: '체력',
  MANA: '마나',
};

export const RANKING_STAT_OPTIONS: { label: string; value: StatKey }[] = [
  { label: '힘', value: 'STRENGTH' },
  { label: '민첩', value: 'AGILITY' },
  { label: '지능', value: 'INTELLIGENCE' },
  { label: '행운', value: 'LUCK' },
  { label: '체력', value: 'VITALITY' },
  { label: '마나', value: 'MANA' },
];
