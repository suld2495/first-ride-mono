import { logout } from '@repo/shared/api/auth.api';
import { act, waitFor } from '@testing-library/react-native';

import { deletePushToken } from '@/api/push-token.api';
import * as tokenStorage from '@/api/token-storage.api';
import { clearRoutineShareTargets } from '@/share/routine-share';
import { useAuthStore } from '@/store/auth.store';
import { clearRoutineWidgetSnapshot } from '@/widget/routine-widget-native';

jest.unmock('@/store/auth.store');

jest.mock('@repo/shared/api/auth.api', () => ({
  logout: jest.fn(),
}));

jest.mock('@/api/push-token.api', () => ({
  deletePushToken: jest.fn(),
}));

jest.mock('@/share/routine-share', () => ({
  clearRoutineShareTargets: jest.fn(),
}));

jest.mock('@/widget/routine-widget-native', () => ({
  clearRoutineWidgetSnapshot: jest.fn(),
}));

const mockedLogout = jest.mocked(logout);
const mockedDeletePushToken = jest.mocked(deletePushToken);
const mockedClearRoutineShareTargets = jest.mocked(clearRoutineShareTargets);
const mockedClearRoutineWidgetSnapshot = jest.mocked(
  clearRoutineWidgetSnapshot,
);

describe('auth.store', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedLogout.mockResolvedValue({ message: 'ok' });
    mockedDeletePushToken.mockResolvedValue(true);
    mockedClearRoutineShareTargets.mockResolvedValue();
    mockedClearRoutineWidgetSnapshot.mockResolvedValue();
    jest
      .spyOn(tokenStorage, 'getRefreshToken')
      .mockResolvedValue('current-device-refresh-token');

    await act(async () => {
      await useAuthStore.persist.clearStorage();
      useAuthStore.setState({
        user: null,
        lastUserId: null,
        isLoading: true,
      });
    });
  });

  it('스토어 hydration이 끝나면 로딩 상태를 해제한다', async () => {
    await act(async () => {
      await useAuthStore.persist.rehydrate();
    });

    await waitFor(() => {
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  it('로그아웃해도 마지막 로그인 아이디는 유지한다', async () => {
    await act(async () => {
      useAuthStore.getState().signIn({
        userId: 'last@example.com',
        nickname: '라스트',
        motto: null,
        mottos: [],
        role: 'USER',
      });
    });

    expect(useAuthStore.getState().lastUserId).toBe('last@example.com');

    await act(async () => {
      await useAuthStore.getState().signOut();
    });

    expect(useAuthStore.getState()).toEqual(
      expect.objectContaining({
        user: null,
        lastUserId: 'last@example.com',
        isLoading: false,
      }),
    );
    expect(mockedLogout).toHaveBeenCalledWith({
      refreshToken: 'current-device-refresh-token',
    });
  });

  it('SNS 로그인 사용자는 로그아웃 후 아이디를 남기지 않는다', async () => {
    useAuthStore.setState({
      user: null,
      lastUserId: 'previous@example.com',
      isLoading: false,
    });

    await act(async () => {
      useAuthStore.getState().signIn({
        userId: 'kakao_12345',
        nickname: '카카오',
        motto: null,
        mottos: [],
        role: 'USER',
        loginType: 'KAKAO',
      });
      await useAuthStore.getState().signOut();
    });

    expect(useAuthStore.getState()).toEqual(
      expect.objectContaining({
        user: null,
        lastUserId: null,
        isLoading: false,
      }),
    );
  });

  it('복원된 SNS 세션을 로컬 로그아웃해도 아이디를 남기지 않는다', async () => {
    useAuthStore.setState({
      user: {
        userId: 'apple_12345',
        nickname: '애플',
        motto: null,
        mottos: [],
        role: 'USER',
        loginType: 'APPLE',
      },
      lastUserId: 'stale@example.com',
      isLoading: false,
    });

    await act(async () => {
      await useAuthStore.getState().signOutLocally();
    });

    expect(useAuthStore.getState().lastUserId).toBeNull();
  });

  it('저장된 마지막 아이디가 없어도 현재 로그인 사용자의 아이디를 로그아웃 후 유지한다', async () => {
    await act(async () => {
      useAuthStore.setState({
        user: {
          userId: 'hydrated@example.com',
          nickname: '하이드레이트',
          motto: null,
          mottos: [],
          role: 'USER',
        },
        lastUserId: null,
        isLoading: false,
      });
    });

    await act(async () => {
      await useAuthStore.getState().signOut();
    });

    expect(useAuthStore.getState()).toEqual(
      expect.objectContaining({
        user: null,
        lastUserId: 'hydrated@example.com',
        isLoading: false,
      }),
    );
  });

  it('refresh token이 없으면 서버 요청 없이 로컬 세션만 정리한다', async () => {
    jest.spyOn(tokenStorage, 'getRefreshToken').mockResolvedValue(null);

    await act(async () => {
      useAuthStore.getState().signIn({
        userId: 'local@example.com',
        nickname: '로컬',
        motto: null,
        mottos: [],
        role: 'USER',
      });
      await useAuthStore.getState().signOut();
    });

    expect(mockedLogout).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('이미 사용자 상태가 비어 있으면 저장된 마지막 아이디를 유지한다', async () => {
    useAuthStore.setState({
      user: null,
      lastUserId: 'remembered@example.com',
      isLoading: false,
    });

    await act(async () => {
      await useAuthStore.getState().signOutLocally();
    });

    expect(useAuthStore.getState().lastUserId).toBe('remembered@example.com');
  });

  it('SecureStore 토큰 삭제가 실패해도 사용자 상태와 나머지 로컬 데이터를 정리한다', async () => {
    jest
      .spyOn(tokenStorage, 'clearTokens')
      .mockRejectedValueOnce(new Error('secure store failed'));
    useAuthStore.getState().signIn({
      userId: 'secure-store@example.com',
      nickname: '보안저장소',
      motto: null,
      mottos: [],
      role: 'USER',
    });

    await expect(
      useAuthStore.getState().signOutLocally(),
    ).resolves.toBeUndefined();

    expect(useAuthStore.getState().user).toBeNull();
    expect(mockedClearRoutineWidgetSnapshot).toHaveBeenCalledTimes(1);
    expect(mockedClearRoutineShareTargets).toHaveBeenCalledTimes(1);
  });

  it('위젯 정리가 실패해도 사용자 상태와 공유 확장 데이터를 정리한다', async () => {
    mockedClearRoutineWidgetSnapshot.mockRejectedValueOnce(
      new Error('widget failed'),
    );
    useAuthStore.getState().signIn({
      userId: 'widget@example.com',
      nickname: '위젯',
      motto: null,
      mottos: [],
      role: 'USER',
    });

    await expect(
      useAuthStore.getState().signOutLocally(),
    ).resolves.toBeUndefined();

    expect(useAuthStore.getState().user).toBeNull();
    expect(mockedClearRoutineShareTargets).toHaveBeenCalledTimes(1);
  });

  it('공유 확장 정리가 실패해도 사용자 상태를 로그아웃으로 유지한다', async () => {
    mockedClearRoutineShareTargets.mockRejectedValueOnce(
      new Error('share extension failed'),
    );
    useAuthStore.getState().signIn({
      userId: 'share@example.com',
      nickname: '공유',
      motto: null,
      mottos: [],
      role: 'USER',
    });

    await expect(
      useAuthStore.getState().signOutLocally(),
    ).resolves.toBeUndefined();

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('로컬 정리가 끝나지 않아도 사용자 상태를 먼저 로그아웃으로 전환한다', async () => {
    let finishWidgetCleanup: (() => void) | undefined;
    mockedClearRoutineWidgetSnapshot.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishWidgetCleanup = resolve;
        }),
    );
    useAuthStore.getState().signIn({
      userId: 'pending@example.com',
      nickname: '대기',
      motto: null,
      mottos: [],
      role: 'USER',
    });

    const signOutPromise = useAuthStore.getState().signOutLocally();

    expect(useAuthStore.getState().user).toBeNull();
    await waitFor(() => {
      expect(mockedClearRoutineShareTargets).toHaveBeenCalledTimes(1);
    });

    finishWidgetCleanup?.();
    await expect(signOutPromise).resolves.toBeUndefined();
  });

  it('서버 정리 실패를 격리하고 푸시 토큰까지 정리한 뒤 로컬 로그아웃한다', async () => {
    mockedLogout.mockRejectedValueOnce(new Error('logout api failed'));
    mockedDeletePushToken.mockRejectedValueOnce(
      new Error('push token api failed'),
    );
    useAuthStore.getState().signIn({
      userId: 'remote@example.com',
      nickname: '서버정리',
      motto: null,
      mottos: [],
      role: 'USER',
    });

    await expect(
      useAuthStore.getState().signOut('ExponentPushToken[test]'),
    ).resolves.toBeUndefined();

    expect(mockedDeletePushToken).toHaveBeenCalledWith(
      'ExponentPushToken[test]',
    );
    expect(useAuthStore.getState().user).toBeNull();
  });
});
