import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

import { useNotifications } from '@/hooks/useNotifications';
import type {
  NotificationResponse,
  NotificationResponseHandlingMode,
} from '@/types/notification-types';

jest.unmock('@/hooks/useNotifications');

const mockUseLastNotificationResponse = jest.mocked(
  Notifications.useLastNotificationResponse,
);
const mockClearLastNotificationResponseAsync = jest.mocked(
  Notifications.clearLastNotificationResponseAsync,
);

const createNotificationResponse = (
  identifier: string,
  data: Record<string, unknown>,
): Notifications.NotificationResponse => ({
  notification: {
    date: 1_754_041_600_000,
    request: {
      identifier,
      content: {
        title: '루틴 알림',
        subtitle: null,
        body: '새로운 인증 요청이 도착했습니다.',
        data,
        categoryIdentifier: 'routine-category',
        sound: 'default',
      },
      trigger: null,
    },
  },
  actionIdentifier: 'expo.modules.notifications.actions.DEFAULT',
});

describe('useNotifications 알림 응답 처리', () => {
  let responseListener:
    | ((response: Notifications.NotificationResponse) => void)
    | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    responseListener = undefined;
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({
      status: 'granted' as Notifications.PermissionStatus,
      granted: true,
      canAskAgain: true,
      expires: 'never',
      ios: {
        status: 2 as Notifications.IosAuthorizationStatus,
        allowsDisplayInNotificationCenter: true,
        allowsDisplayOnLockScreen: true,
        allowsAlert: true,
        allowsBadge: true,
        allowsSound: true,
        allowsDisplayInCarPlay: true,
        allowsCriticalAlerts: false,
        alertStyle: 1 as Notifications.IosAlertStyle,
        allowsAnnouncements: false,
      },
    });
    jest.mocked(Notifications.getExpoPushTokenAsync).mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[test]',
    });
    jest
      .mocked(Notifications.addNotificationReceivedListener)
      .mockReturnValue({ remove: jest.fn() });
    jest
      .mocked(Notifications.addNotificationResponseReceivedListener)
      .mockImplementation((listener) => {
        responseListener = listener;

        return { remove: jest.fn() };
      });
    mockClearLastNotificationResponseAsync.mockResolvedValue(undefined);
  });

  it('인증 복원이 끝나면 cold start 알림 응답을 처리한다', async () => {
    const response = createNotificationResponse('notification-b', {
      type: 'routine-request',
      requestId: 22,
    });
    const onResponseReceived = jest.fn<Promise<void>, [NotificationResponse]>(
      () => Promise.resolve(),
    );

    mockUseLastNotificationResponse.mockReturnValue(response);

    const { rerender } = renderHook<
      ReturnType<typeof useNotifications>,
      { responseHandlingMode: NotificationResponseHandlingMode }
    >(
      ({ responseHandlingMode }) =>
        useNotifications({ onResponseReceived }, { responseHandlingMode }),
      {
        initialProps: { responseHandlingMode: 'defer' as const },
      },
    );

    expect(onResponseReceived).not.toHaveBeenCalled();

    rerender({ responseHandlingMode: 'handle' as const });

    await waitFor(() => {
      expect(onResponseReceived).toHaveBeenCalledWith(response);
    });
    expect(mockClearLastNotificationResponseAsync).toHaveBeenCalledTimes(1);
  });

  it('로그아웃 상태가 확정되면 대기 중인 알림 응답을 폐기한다', async () => {
    const response = createNotificationResponse('notification-signed-out', {
      type: 'friend-request',
    });
    const onResponseReceived = jest.fn();

    mockUseLastNotificationResponse.mockReturnValue(response);

    renderHook(() =>
      useNotifications(
        { onResponseReceived },
        { responseHandlingMode: 'discard' },
      ),
    );

    await waitFor(() => {
      expect(mockClearLastNotificationResponseAsync).toHaveBeenCalledTimes(1);
    });
    expect(onResponseReceived).not.toHaveBeenCalled();
  });

  it('하나의 알림 응답을 한 번만 처리한다', async () => {
    const response = createNotificationResponse('notification-once', {
      type: 'friend-accepted',
    });
    const onResponseReceived = jest.fn(() => Promise.resolve());

    mockUseLastNotificationResponse.mockReturnValue(response);

    renderHook(() =>
      useNotifications(
        { onResponseReceived },
        { responseHandlingMode: 'handle' },
      ),
    );

    await waitFor(() => {
      expect(onResponseReceived).toHaveBeenCalledTimes(1);
    });

    act(() => {
      responseListener?.(response);
    });

    expect(onResponseReceived).toHaveBeenCalledTimes(1);
  });
});
