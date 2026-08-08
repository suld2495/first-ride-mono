import type { RoutineDetail } from '@repo/types';
import { Asset } from 'expo-asset';

import RoutineProofDetailModal from '@/components/modal/routine-proof-detail-modal';

const previewImages = [
  Asset.fromModule(require('../assets/hall-of-heroes/ale-wooden-stein.png')).uri,
  Asset.fromModule(require('../assets/hall-of-heroes/moon-archer.png')).uri,
  Asset.fromModule(require('../assets/hall-of-heroes/hye-mage.png')).uri,
];

const previewDetail: RoutineDetail = {
  id: 1,
  nickname: '메이트',
  requesterNickname: '나',
  routineName: '아침 물 한 잔 마시기',
  routineDetail: '하루를 시작하기 전에 물 한 잔을 마셔요.',
  imagePaths: previewImages,
  createdAt: '2026-08-08T07:42:00+09:00',
  checkedAt: '2026-08-08T08:05:00+09:00',
  checkStatus: 'PASS',
  message: '오늘도 루틴 완료했어!',
  checkComment: '좋아! 내일도 같이 해보자.',
};

export default function RoutineProofPreview() {
  return (
    <RoutineProofDetailModal
      previewDetail={previewDetail}
      previewCurrentNickname="나"
    />
  );
}
