import Account from '@/app/account';
import { useModal } from '@/hooks/useModal';

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('@/components/modal/friend-request-list-modal', () => jest.fn());
jest.mock('@/components/modal/friend-routines-modal', () => jest.fn());
jest.mock('@/components/modal/hidden-routines-modal', () => jest.fn());
jest.mock('@/components/modal/privacy-modal', () => jest.fn());
jest.mock('@/components/modal/quest-detail-modal', () => jest.fn());
jest.mock('@/components/modal/quest-form-modal', () => jest.fn());
jest.mock('@/components/modal/request-detail-modal', () => jest.fn());
jest.mock('@/components/modal/request-list-modal', () => jest.fn());
jest.mock('@/components/modal/request-modal', () => jest.fn());
jest.mock('@/components/modal/routine-detail-modal', () => jest.fn());
jest.mock('@/components/modal/routine-form-modal', () => jest.fn());
jest.mock('@/components/modal/routine-reorder-modal', () => jest.fn());
jest.mock('@/components/modal/terms-policy-modal', () => jest.fn());
jest.mock('@/components/modal/theme-modal', () => jest.fn());

describe('useModal', () => {
  it('한마디 모달을 공통 모달에 매핑한다', () => {
    const [title, ModalComponent] = useModal('account');

    expect(title).toBe('한마디');
    expect(ModalComponent).toBe(Account);
  });

  it('퀘스트 상세 모달은 공통 모달 좌우 패딩을 20px로 사용한다', () => {
    const [, , options] = useModal('quest-detail');

    expect(options.contentPaddingHorizontal).toBe(20);
  });

  it('숨긴 루틴 모아보기 모달을 공통 모달에 매핑한다', () => {
    const [title] = useModal('hidden-routines');

    expect(title).toBe('숨긴 루틴 모아보기');
  });
});
