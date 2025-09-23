import { SearchOption } from '@repo/types';

export const friendKey = {
  all: ['friend'],
  list: (option: SearchOption) => [...friendKey.all, option],
  detail: (friendId: number) => [...friendKey.all, friendId],
};

export const friendRequestKey = {
  all: ['friend-request'],
  list: (page: number) => [...friendRequestKey.all, page],
};
