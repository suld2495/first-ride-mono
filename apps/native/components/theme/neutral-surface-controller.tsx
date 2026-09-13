import { useGlobalSearchParams, useSegments } from 'expo-router';
import { useLayoutEffect } from 'react';

import {
  setNeutralSurfaceRenderSnapshot,
  useSetNeutralSurface,
} from '@/hooks/useEffectiveColorScheme';

const ROUTINE_HOME_SEGMENT = '(routine)';
const ROUTINE_DETAIL_SEGMENT = 'detail';
const MODAL_SEGMENT = 'modal';
const FRIEND_HOME_MODAL_TYPE = 'friend-routines';

const getFirstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

/**
 * 현재 라우트가 "홈"(내 루틴 홈, 친구 루틴 홈)인지 판별해 중립 표면 적용 여부를 스토어에 반영한다.
 * 홈 화면은 직업 테마 배경·캐릭터 씬을 그대로 쓰고, 그 외 모든 화면은 회색 계열로 그린다.
 */
export const isThemedHomeRoute = (
  segments: readonly string[],
  modalType?: string,
) => {
  const isRoutineHome =
    segments.includes(ROUTINE_HOME_SEGMENT) &&
    !segments.includes(ROUTINE_DETAIL_SEGMENT);
  const isFriendHome =
    segments[0] === MODAL_SEGMENT && modalType === FRIEND_HOME_MODAL_TYPE;

  return isRoutineHome || isFriendHome;
};

const NeutralSurfaceController = () => {
  const segments = useSegments() as readonly string[];
  const { type } = useGlobalSearchParams<{ type?: string | string[] }>();
  const setNeutralSurface = useSetNeutralSurface();
  const modalType = getFirstParam(type);
  const neutralSurface = !isThemedHomeRoute(segments, modalType);

  // 이 컴포넌트는 화면 트리보다 먼저 렌더링되므로, 같은 패스에서 그려지는 화면이 올바른 값을 읽도록 렌더 중 기록한다.
  setNeutralSurfaceRenderSnapshot(neutralSurface);

  // 첫 페인트 전에 스토어에 반영해 훅 구독자(Container, ThemeView, Typography 등)를 갱신한다.
  useLayoutEffect(() => {
    setNeutralSurface(neutralSurface);
  }, [neutralSurface, setNeutralSurface]);

  return null;
};

export default NeutralSurfaceController;
