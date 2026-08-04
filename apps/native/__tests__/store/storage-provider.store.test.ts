import * as SecureStore from 'expo-secure-store';

import { storage } from '@/store/storage-provider.store';

const mockedSecureStore = jest.mocked(SecureStore);

describe('secure Zustand storage', () => {
  beforeEach(() => {
    mockedSecureStore.getItemAsync.mockReset();
    mockedSecureStore.setItemAsync.mockReset();
    mockedSecureStore.deleteItemAsync.mockReset();
  });

  it('Keychain 조회가 실패해도 빈 저장소로 복구한다', async () => {
    mockedSecureStore.getItemAsync.mockRejectedValueOnce(
      new Error('Keychain access failed'),
    );

    await expect(storage?.getItem('auth-storage')).resolves.toBeNull();
  });

  it('Keychain 저장이 실패해도 처리되지 않은 Promise 예외를 만들지 않는다', async () => {
    mockedSecureStore.setItemAsync.mockRejectedValueOnce(
      new Error('Keychain access failed'),
    );

    await expect(
      storage?.setItem('auth-storage', {
        state: { user: null },
        version: 0,
      }),
    ).resolves.toBeUndefined();
  });

  it('Keychain 삭제가 실패해도 정리 흐름을 중단하지 않는다', async () => {
    mockedSecureStore.deleteItemAsync.mockRejectedValueOnce(
      new Error('Keychain access failed'),
    );

    await expect(storage?.removeItem('auth-storage')).resolves.toBeUndefined();
  });
});
