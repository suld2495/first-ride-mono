import * as SecureStore from 'expo-secure-store';
import { createJSONStorage } from 'zustand/middleware';

export const storage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      // 저장소를 읽을 수 없어도 상태 복구를 끝내 앱 진입을 막지 않는다.
      return null;
    }
  },

  setItem: async (name: string, value: string) => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Keychain 오류가 비동기 미처리 예외가 되어 앱을 방해하지 않게 한다.
    }
  },

  removeItem: async (name: string) => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // 저장소 정리 실패와 관계없이 로그아웃/초기화 흐름을 계속한다.
    }
  },
}));
