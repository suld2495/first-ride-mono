import { logout } from '@repo/shared/api/auth.api';
import { act, waitFor } from '@testing-library/react-native';

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
});
