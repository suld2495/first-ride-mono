import { SearchOption } from '@repo/types';

export const friendKey = {
  all: ['friend'],
  list: (option: SearchOption) => [...friendKey.all, option],
  detail: (friendId: number) => [...friendKey.all, friendId],
};
