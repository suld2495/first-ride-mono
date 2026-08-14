import axiosInstance from '@repo/shared/api';
import {
  NOTIFICATION_SUBTYPES,
  type NotificationSettings,
} from '@repo/shared/api/notification-settings.api';
import { useUpdateNotificationSettingsMutation } from '@repo/shared/hooks/useNotificationSettings';
import {
  useRandomFriendRecommendationSettingsQuery,
  useUpdateRandomFriendRecommendationSettingsMutation,
} from '@repo/shared/hooks/useFriend';
import { notificationSettingsKeys } from '@repo/shared/types/query-keys/notification-settings';
import { friendKey } from '@repo/shared/types/query-keys/friend';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';

let mockAxios: MockAdapter;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const TestQueryProvider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  TestQueryProvider.displayName = 'NotificationSettingsHookTestProvider';

  return TestQueryProvider;
};

const createNotificationSettings = (enabled = true): NotificationSettings => ({
  allEnabled: enabled,
  subtypes: Object.fromEntries(
    NOTIFICATION_SUBTYPES.map((subtype) => [subtype, enabled]),
  ) as NotificationSettings['subtypes'],
  dailyRoutineReminderCount: 1,
  dailyRoutineReminderTimes: ['18:00:00'],
});

describe('useUpdateNotificationSettingsMutation', () => {
  const userId = 'account-a';

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('서버 응답 전에 알림 설정 캐시를 낙관적으로 갱신한다', async () => {
    const queryClient = createTestQueryClient();
    const queryKey = notificationSettingsKeys.detail(userId);
    const initialSettings = createNotificationSettings(true);
    let resolvePatch: (() => void) | undefined;

    queryClient.setQueryData(queryKey, initialSettings);
    mockAxios.onPatch('/notifications/settings').reply(
      () =>
        new Promise((resolve) => {
          resolvePatch = () => {
            resolve([
              200,
              {
                data: {
                  allEnabled: true,
                  settings: {
                    FRIEND_REQUEST: false,
                  },
                },
              },
            ]);
          };
        }),
    );

    const { result } = renderHook(
      () => useUpdateNotificationSettingsMutation(userId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    act(() => {
      result.current.mutate({
        subtypes: {
          FRIEND_REQUEST: false,
        },
      });
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<NotificationSettings>(queryKey)?.subtypes
          .FRIEND_REQUEST,
      ).toBe(false);
    });
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      resolvePatch?.();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('알림 설정 변경 실패 시 이전 캐시로 롤백한다', async () => {
    const queryClient = createTestQueryClient();
    const queryKey = notificationSettingsKeys.detail(userId);
    const initialSettings = createNotificationSettings(true);

    queryClient.setQueryData(queryKey, initialSettings);
    mockAxios.onPatch('/notifications/settings').reply(500, {
      success: false,
      error: {
        message: '서버 오류가 발생했습니다.',
      },
    });

    const { result } = renderHook(
      () => useUpdateNotificationSettingsMutation(userId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    act(() => {
      result.current.mutate({
        subtypes: {
          FRIEND_REQUEST: false,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(queryClient.getQueryData(queryKey)).toEqual(initialSettings);
  });
});

describe('useRandomFriendRecommendationSettingsQuery', () => {
  const userId = 'account-a';

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('랜덤 친구 추천 노출 설정을 조회해 캐시에 저장한다', async () => {
    const queryClient = createTestQueryClient();
    mockAxios.onGet('/users/me/random-friend-settings').reply(200, {
      data: { randomFriendRecommendationEnabled: false },
    });

    const { result } = renderHook(
      () => useRandomFriendRecommendationSettingsQuery(userId),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        randomFriendRecommendationEnabled: false,
      });
    });
    expect(
      queryClient.getQueryData(friendKey.recommendationSettings(userId)),
    ).toEqual({ randomFriendRecommendationEnabled: false });
  });
});

describe('useUpdateRandomFriendRecommendationSettingsMutation', () => {
  const userId = 'account-a';

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('서버 응답 전에 랜덤 친구 추천 노출 설정 캐시를 낙관적으로 갱신한다', async () => {
    const queryClient = createTestQueryClient();
    const queryKey = friendKey.recommendationSettings(userId);
    queryClient.setQueryData(queryKey, {
      randomFriendRecommendationEnabled: true,
    });
    let resolvePatch: (() => void) | undefined;
    mockAxios.onPatch('/users/me/random-friend-settings').reply(
      () =>
        new Promise((resolve) => {
          resolvePatch = () => {
            resolve([
              200,
              { data: { randomFriendRecommendationEnabled: false } },
            ]);
          };
        }),
    );

    const { result } = renderHook(
      () => useUpdateRandomFriendRecommendationSettingsMutation(userId),
      { wrapper: createWrapper(queryClient) },
    );

    act(() => {
      result.current.mutate(false);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(queryKey)).toEqual({
        randomFriendRecommendationEnabled: false,
      });
    });
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      resolvePatch?.();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('랜덤 친구 추천 노출 설정 변경 실패 시 이전 캐시로 롤백한다', async () => {
    const queryClient = createTestQueryClient();
    const queryKey = friendKey.recommendationSettings(userId);
    const initialSettings = {
      randomFriendRecommendationEnabled: true,
    };
    queryClient.setQueryData(queryKey, initialSettings);
    mockAxios.onPatch('/users/me/random-friend-settings').reply(500, {
      success: false,
      error: { message: '서버 오류가 발생했습니다.' },
    });

    const { result } = renderHook(
      () => useUpdateRandomFriendRecommendationSettingsMutation(userId),
      { wrapper: createWrapper(queryClient) },
    );

    act(() => {
      result.current.mutate(false);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(queryClient.getQueryData(queryKey)).toEqual(initialSettings);
  });
});
