import type { Request, RequestList } from '@repo/types';

// ========================================
// Request Mock Factory
// ========================================

export interface CreateMockRequestOptions {
  image?: string;
  checkStatus?: Request['checkStatus'];
  checkComment?: string;
  createdAt?: string;
}

export const createMockRequest = (
  index: number = 0,
  options: CreateMockRequestOptions = {},
): Request => ({
  id: index + 1,
  image: options.image ?? 'https://example.com/image.jpg',
  checkStatus: options.checkStatus ?? 'DRAFT',
  checkComment: options.checkComment ?? '',
  createdAt: options.createdAt ?? new Date().toISOString(),
});

export const createMockRequests = (
  count: number,
  options: CreateMockRequestOptions = {},
): Request[] =>
  Array.from({ length: count }, (_, index) =>
    createMockRequest(index, options),
  );

// ========================================
// RequestList Mock Factory
// ========================================

export interface CreateMockRequestListItemOptions {
  routineName?: string;
  nickname?: string;
  mateNickname?: string;
  createdAt?: string;
}

export const createMockRequestListItem = (
  index: number = 0,
  options: CreateMockRequestListItemOptions = {},
): RequestList[number] => ({
  id: index + 1,
  routineName: options.routineName ?? `테스트 루틴 ${index + 1}`,
  nickname: options.nickname ?? 'testuser',
  mateNickname: options.mateNickname ?? 'mate',
  createdAt: options.createdAt ?? new Date().toISOString(),
});

export const createMockRequestList = (
  count: number,
  options: CreateMockRequestListItemOptions = {},
): RequestList =>
  Array.from({ length: count }, (_, index) =>
    createMockRequestListItem(index, options),
  );
