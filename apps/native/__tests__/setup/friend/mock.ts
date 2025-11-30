import type { Friend, FriendRequest } from '@repo/types';

// ========================================
// Friend Mock Factory
// ========================================

export interface CreateMockFriendOptions {
  nickname?: string;
  job?: string;
  profileImage?: string | null;
  friendSince?: string;
}

export const createMockFriend = (
  index: number = 0,
  options: CreateMockFriendOptions = {},
): Friend => ({
  nickname: options.nickname ?? `friend${index + 1}`,
  job: options.job ?? '직장인',
  profileImage: options.profileImage ?? null,
  friendSince: options.friendSince ?? new Date().toISOString(),
});

export const createMockFriends = (
  count: number,
  options: CreateMockFriendOptions = {},
): Friend[] =>
  Array.from({ length: count }, (_, index) => createMockFriend(index, options));

// ========================================
// FriendRequest Mock Factory
// ========================================

export interface CreateMockFriendRequestOptions {
  senderNickname?: string;
  receiverNickname?: string;
  status?: FriendRequest['status'];
  createdAt?: Date;
}

export const createMockFriendRequest = (
  index: number = 0,
  options: CreateMockFriendRequestOptions = {},
): FriendRequest => ({
  id: index + 1,
  senderNickname: options.senderNickname ?? `sender${index + 1}`,
  receiverNickname: options.receiverNickname ?? 'testuser',
  status: options.status ?? 'PENDING',
  createdAt: options.createdAt ?? new Date(),
});

export const createMockFriendRequests = (
  count: number,
  options: CreateMockFriendRequestOptions = {},
): FriendRequest[] =>
  Array.from({ length: count }, (_, index) =>
    createMockFriendRequest(index, options),
  );
