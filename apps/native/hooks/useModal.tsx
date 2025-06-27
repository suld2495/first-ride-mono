import PrivacyModal from '@/components/modal/PrivacyModal';
import RequestDetailModal from '@/components/modal/RequestDetailModal';
import RequestListModal from '@/components/modal/RequestListModal';
import RequestModal from '@/components/modal/RequestModal';
import RoutineDetailModal from '@/components/modal/RoutineDetailModal';
import RoutineFormModal from '@/components/modal/RoutineFormModal';
import TermsPolicyModal from '@/components/modal/TermsPolicyModal';

export type ModalType =
  | 'routine-add'
  | 'routine-update'
  | 'routine-detail'
  | 'request'
  | 'request-list'
  | 'request-detail'
  | 'policies'
  | 'privacy';

export const useModal = (type: ModalType): [string, () => React.ReactNode] => {
  switch (type) {
    case 'routine-add':
      return ['루틴 추가', RoutineFormModal];
    case 'routine-update':
      return ['루틴 수정', RoutineFormModal];
    case 'routine-detail':
      return ['루틴 상세', RoutineDetailModal];
    case 'request':
      return ['인증 요청', RequestModal];
    case 'request-list':
      return ['인증 요청', RequestListModal];
    case 'request-detail':
      return ['인증 상세', RequestDetailModal];
    case 'policies':
      return ['약관 및 정책', TermsPolicyModal];
    case 'privacy':
      return ['개인정보 처리방침', PrivacyModal];
    default:
      throw new Error('존재하지 않은 모달입니다.');
  }
};
