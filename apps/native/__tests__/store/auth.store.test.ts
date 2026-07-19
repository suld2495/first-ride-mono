import { logout } from '@repo/shared/api/auth.api';
import { act, waitFor } from '@testing-library/react-native';

import * as tokenStorage from '@/api/token-storage.api';
import { clearRoutineShareTargets } from '@/share/routine-share';
import { useAuthStore } from '@/store/auth.store';
import { clearRoutineWidgetSnapshot } from '@/widget/routine-widget-native';

jest.unmock('@/store/auth.store');

jest.mock('@repo/shared/api/auth.api', () => ({
  logout: jest.fn(),
}));

jest.mock('@/share/routine-share', () => ({
  clearRoutineShareTargets: jest.fn(),
}));

jest.mock('@/widget/routine-widget-native', () => ({
  clearRoutineWidgetSnapshot: jest.fn(),
}));

const mockedLogout = jest.mocked(logout);
const mockedClearRoutineShareTargets = jest.mocked(clearRoutineShareTargets);
const mockedClearRoutineWidgetSnapshot = jest.mocked(
  clearRoutineWidgetSnapshot,
);

describe('auth.store', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedLogout.mockResolvedValue({ message: 'ok' });
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
});
