import { act, waitFor } from '@testing-library/react-native';

jest.unmock('@/store/auth.store');

import { useAuthStore } from '@/store/auth.store';

describe('auth.store', () => {
  beforeEach(async () => {
    await act(async () => {
      await useAuthStore.persist.clearStorage();
      useAuthStore.setState({ user: null, isLoading: true });
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
});
