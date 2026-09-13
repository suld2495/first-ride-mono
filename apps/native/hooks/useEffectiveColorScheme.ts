import {
  getEffectiveColorScheme,
  useColorSchemeStore,
} from '@/store/color-scheme.store';

export const getEffectiveColorSchemeSnapshot = () =>
  getEffectiveColorScheme(useColorSchemeStore.getState());

export const useEffectiveColorScheme = () =>
  useColorSchemeStore((state) => getEffectiveColorScheme(state));

// 라우트 판별 컴포넌트가 렌더 중 기록하는 값. 같은 렌더 패스에서 뒤에 그려지는 화면의
// StyleSheet.create 스타일이 스토어 업데이트(레이아웃 이펙트)보다 먼저 올바른 값을 읽게 한다.
let neutralSurfaceRenderSnapshot: boolean | null = null;

export const setNeutralSurfaceRenderSnapshot = (neutralSurface: boolean) => {
  neutralSurfaceRenderSnapshot = neutralSurface;
};

export const getNeutralSurfaceSnapshot = () =>
  neutralSurfaceRenderSnapshot ?? useColorSchemeStore.getState().neutralSurface;

export const useNeutralSurface = () =>
  useColorSchemeStore((state) => state.neutralSurface);

export const useSetNeutralSurface = () =>
  useColorSchemeStore((state) => state.setNeutralSurface);
