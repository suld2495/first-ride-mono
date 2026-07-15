import Account from '@/app/account';
import { useModal } from '@/hooks/useModal';
import { normalizeModalType } from '@/types/modal';

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
jest.mock('@/components/modal/stat-modal', () => jest.fn());
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

  it('받은 요청 목록 모달은 타이틀을 변경하고 공통 모달 좌우 패딩을 제거한다', () => {
    const [title, , options] = useModal('request-list');

    expect(title).toBe('받은 요청');
    expect(options.contentPaddingHorizontal).toBe(0);
  });

  it('인증 요청 작성 모달은 공통 모달 좌우 패딩을 제거한다', () => {
    const [, , options] = useModal('request');

    expect(options.contentPaddingHorizontal).toBe(0);
  });

  it('인증 요청 상세 모달은 공통 모달 좌우 패딩을 제거한다', () => {
    const [, , options] = useModal('request-detail');

    expect(options.contentPaddingHorizontal).toBe(0);
  });

  it('숨긴 루틴 모아보기 모달을 공통 모달에 매핑한다', () => {
    const [title] = useModal('hidden-routines');

    expect(title).toBe('숨긴 루틴 모아보기');
  });

  it('테마 설정 모달을 공통 모달에 매핑한다', () => {
    const [title] = useModal('theme');

    expect(title).toBe('테마 설정');
  });

  it('스탯 모달을 공통 모달에 매핑한다', () => {
    const [title] = useModal('stat');

    expect(title).toBe('스탯');
  });

  it('기존 routine-edit 모달 타입을 routine-update로 정규화한다', () => {
    expect(normalizeModalType('routine-edit')).toBe('routine-update');
  });

  it('알 수 없는 모달 타입은 null로 정규화한다', () => {
    expect(normalizeModalType('unknown-modal')).toBeNull();
  });
});
