import { SearchOption } from '@repo/types';

export const userKey = {
  all: ['user'],
  list: (option: SearchOption) => [...userKey.all, option],
  detail: (userId: number) => [...userKey.all, userId],
};
