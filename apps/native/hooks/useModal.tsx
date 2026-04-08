import FriendRequestListModal from '@/components/modal/friend-request-list-modal';
import PrivacyModal from '@/components/modal/privacy-modal';
import QuestDetailModal from '@/components/modal/quest-detail-modal';
import QuestFormModal from '@/components/modal/quest-form-modal';
import RequestDetailModal from '@/components/modal/request-detail-modal';
import RequestListModal from '@/components/modal/request-list-modal';
import RequestModal from '@/components/modal/request-modal';
import RoutineDetailModal from '@/components/modal/routine-detail-modal';
import RoutineFormModal from '@/components/modal/routine-form-modal';
import TermsPolicyModal from '@/components/modal/terms-policy-modal';
import ThemeModal from '@/components/modal/theme-modal';

export type ModalType =
  | 'routine-add'
  | 'routine-update'
  | 'routine-detail'
  | 'quest-add'
  | 'quest-detail'
  | 'request'
  | 'request-list'
  | 'request-detail'
  | 'friend-request-list'
  | 'policies'
  | 'privacy'
  | 'theme';

export const useModal = (type: ModalType): [string, () => React.ReactNode] => {
  switch (type) {
    case 'routine-add':
      return ['루틴 추가', RoutineFormModal];
    case 'routine-update':
      return ['루틴 수정', RoutineFormModal];
    case 'routine-detail':
      return ['루틴 상세', RoutineDetailModal];
    case 'quest-add':
      return ['퀘스트 추가', QuestFormModal];
    case 'quest-detail':
      return ['퀘스트 상세', QuestDetailModal];
    case 'request':
      return ['인증 요청', RequestModal];
    case 'request-list':
      return ['인증 요청', RequestListModal];
    case 'request-detail':
      return ['인증 상세', RequestDetailModal];
    case 'friend-request-list':
      return ['친구 요청', FriendRequestListModal];
    case 'policies':
      return ['약관 및 정책', TermsPolicyModal];
    case 'privacy':
      return ['개인정보 처리방침', PrivacyModal];
    case 'theme':
      return ['테마 설정', ThemeModal];
    default:
      throw new Error('존재하지 않은 모달입니다.');
  }
};
