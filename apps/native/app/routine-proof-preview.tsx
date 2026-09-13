import type { RoutineDetail } from '@repo/types';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalHeader from '@/components/modal/modal-header';
import RoutineProofDetailModal from '@/components/modal/routine-proof-detail-modal';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { routineProofDetailColors } from '@/theme/themes/light';

const previewImages = [
  Asset.fromModule(require('../assets/hall-of-heroes/ale-wooden-stein.png'))
    .uri,
];

const previewDetail: RoutineDetail = {
  id: 1,
  nickname: '메이트',
  requesterNickname: '나',
  responderNickname: '메이트',
  responderCharacterImageUrl: '/assets/characters/warrior_female_beginner.png',
  routineName: '아침 물 한 잔 마시기',
  routineDetail: '하루를 시작하기 전에 물 한 잔을 마셔요.',
  imagePaths: previewImages,
  createdAt: '2026-08-08T07:42:00+09:00',
  checkedAt: '2026-08-08T08:05:00+09:00',
  checkStatus: 'PASS',
  message: '오늘도 루틴 완료했어!',
  checkComment: '좋아! 내일도 같이 해보자.',
  hasRequestMessage: true,
  hasResponseComment: true,
};

// 실제 '루틴 상세' 모달(app/modal.tsx)과 같은 구조로 헤더와 상단 안전영역을 포함해 렌더링한다.
export default function RoutineProofPreview() {
  const insets = useSafeAreaInsets();

  return (
    <ThemeView style={[styles.container, { paddingTop: insets.top }]}>
      <ModalHeader
        title="루틴 상세"
        transparent
        titleColor={routineProofDetailColors.headerTitle}
        backIconColor={routineProofDetailColors.headerIcon}
      />
      <RoutineProofDetailModal
        previewDetail={previewDetail}
        previewCurrentNickname="나"
      />
    </ThemeView>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    backgroundColor: routineProofDetailColors.background,
  },
}));
