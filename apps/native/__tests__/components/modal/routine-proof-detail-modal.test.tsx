import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';

import RoutineProofDetailModal from '../../../components/modal/routine-proof-detail-modal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockRoutineDetail } from '../../setup/routine/mock';

declare const mockRequestStore: {
  requestId: number;
  setRequestId: jest.Mock;
};

describe('RoutineProofDetailModal (완료된 루틴 인증 상세 모달)', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockRequestStore.requestId = 1;
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('인증 정보와 메시지를 읽기 전용으로 표시하고 사진을 확대한다', async () => {
    const imagePaths = [
      'https://example.com/image-1.jpg',
      'https://example.com/image-2.jpg',
      'https://example.com/image-3.jpg',
    ];
    const mockDetail = createMockRoutineDetail(0, {
      routineName: '물 마시기',
      routineDetail: '하루 2L 마시기',
      imagePaths,
      message: '오늘도 완료했어!',
    });

    mockAxios.onGet(/\/routine\/confirm\/detail/).reply(200, {
      data: {
        ...mockDetail,
        checkComment: '잘했어!',
        checkedAt: '2026-08-08T12:10:00',
      },
    });

    const screen = render(<RoutineProofDetailModal />);

    expect(await screen.findByText('물 마시기')).toBeOnTheScreen();
    expect(await screen.findByText('하루 2L 마시기')).toBeOnTheScreen();
    expect(await screen.findByText('인증 사진')).toBeOnTheScreen();
    expect(await screen.findByText('인증 시간')).toBeOnTheScreen();
    expect(await screen.findByText('오늘도 완료했어!')).toBeOnTheScreen();
    expect(await screen.findByText('잘했어!')).toBeOnTheScreen();
    expect(screen.queryByText('응원의 한마디')).toBeNull();
    expect(screen.queryByText('승인')).toBeNull();

    fireEvent.press(screen.getByTestId('routine-proof-image-0'));

    expect(screen.getByTestId('routine-proof-expanded-image')).toBeOnTheScreen();
  });

  it('설명과 인증 데이터가 없으면 관련 영역을 표시하지 않는다', () => {
    mockRequestStore.requestId = 0;
    mockRoutineStore.routineForm = {
      routineName: '저녁 스트레칭',
      routineDetail: '   ',
    };

    const screen = render(<RoutineProofDetailModal />);

    expect(screen.getByText('저녁 스트레칭')).toBeOnTheScreen();
    expect(screen.queryByText('인증 사진')).toBeNull();
    expect(screen.queryByText('인증 시간')).toBeNull();
    expect(screen.queryByText('주고받은 메시지')).toBeNull();
  });

  it('인증 사진이 한 장이면 빈 슬롯은 노출하지 않는다', async () => {
    const mockDetail = createMockRoutineDetail(0, {
      imagePaths: ['https://example.com/image-1.jpg'],
    });

    mockAxios.onGet(/\/routine\/confirm\/detail/).reply(200, {
      data: mockDetail,
    });

    const screen = render(<RoutineProofDetailModal />);

    expect(
      await screen.findByTestId('routine-proof-image-0'),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('routine-proof-image-1')).toBeNull();
    expect(screen.queryByTestId('routine-proof-image-2')).toBeNull();
  });
});
