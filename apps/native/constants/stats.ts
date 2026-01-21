import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { StatKey, UserStats } from '@repo/types';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export interface StatConfig {
  key: keyof UserStats;
  apiKey: StatKey;
  abbr: string;
  name: string;
  icon: IoniconsName;
  color: string;
}

export const STAT_CONFIGS: StatConfig[] = [
  {
    key: 'strength',
    apiKey: 'STRENGTH',
    abbr: 'STR',
    name: 'STRENGTH',
    icon: 'fitness-outline',
    color: '#e74c3c',
  },
  {
    key: 'agility',
    apiKey: 'AGILITY',
    abbr: 'AGI',
    name: 'AGILITY',
    icon: 'flash-outline',
    color: '#2ecc71',
  },
  {
    key: 'intelligence',
    apiKey: 'INTELLIGENCE',
    abbr: 'INT',
    name: 'INTELLIGENCE',
    icon: 'bulb-outline',
    color: '#3498db',
  },
  {
    key: 'luck',
    apiKey: 'LUCK',
    abbr: 'LUK',
    name: 'LUCK',
    icon: 'leaf-outline',
    color: '#f1c40f',
  },
  {
    key: 'vitality',
    apiKey: 'VITALITY',
    abbr: 'VIT',
    name: 'VITALITY',
    icon: 'heart-outline',
    color: '#e91e63',
  },
  {
    key: 'mana',
    apiKey: 'MANA',
    abbr: 'MAN',
    name: 'MANA',
    icon: 'diamond-outline',
    color: '#9b59b6',
  },
];

export const STAT_MAX_VALUE = 100;
