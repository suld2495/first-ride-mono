import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';
import { Image, StyleSheet as NativeStyleSheet } from 'react-native';

import RoutineProofDetailModal from '../../../components/modal/routine-proof-detail-modal';
import {
  fireEvent,
  render,
  resetAuthMocks,
  within,
} from '../../setup/auth-test-utils';
import { createMockRoutineDetail } from '../../setup/routine/mock';

declare const mockRequestStore: {
  requestId: number;
  setRequestId: jest.Mock;
};
declare const mockRoutineStore: {
  routineForm: {
    routineDetail: string;
    routineName: string;
  };
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
        hasRequestMessage: true,
        hasResponseComment: true,
      },
    });

    const screen = render(<RoutineProofDetailModal />);

    expect(await screen.findByText('물 마시기')).toBeOnTheScreen();
    expect(await screen.findByText('하루 2L 마시기')).toBeOnTheScreen();
    expect(await screen.findByText('인증 사진')).toBeOnTheScreen();
    expect(await screen.findByText('인증 시간')).toBeOnTheScreen();
    expect(await screen.findByText('오늘도 완료했어!')).toBeOnTheScreen();
    expect(await screen.findByText('잘했어!')).toBeOnTheScreen();
    expect(
      screen.getByTestId('routine-proof-chat-nickname-requester'),
    ).toHaveTextContent('requester');
    expect(screen.getByText('나')).toBeOnTheScreen();
    expect(screen.queryByText('응원의 한마디')).toBeNull();
    expect(screen.queryByText('승인')).toBeNull();

    fireEvent.press(screen.getByTestId('routine-proof-image-0'));

    expect(
      screen.getByTestId('routine-proof-expanded-image'),
    ).toBeOnTheScreen();
  });

  it('친구 인증은 메시지 플래그가 있으면 안내 문구를 블러 처리해 표시한다', async () => {
    const mockDetail = createMockRoutineDetail(0, {
      imagePaths: [],
      message: null,
    });

    mockAxios.onGet(/\/routine\/confirm\/detail/).reply(200, {
      data: {
        ...mockDetail,
        checkComment: null,
        hasRequestMessage: true,
        hasResponseComment: true,
      },
    });

    const screen = render(<RoutineProofDetailModal />);

    expect(await screen.findByText('주고받은 메시지')).toBeOnTheScreen();
    expect(screen.queryByText('안녕하세요?')).toBeNull();
    expect(
      screen.getByTestId('routine-proof-chat-request-message'),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId('routine-proof-chat-reply-message'),
    ).toBeOnTheScreen();
    expect(
      screen.getAllByTestId('routine-proof-chat-blur-image'),
    ).toHaveLength(2);

    const requestText = within(
      screen.getByTestId('routine-proof-chat-request-message'),
    ).getByTestId('routine-proof-chat-text');
    const requestBlurImage = within(requestText).getByTestId(
      'routine-proof-chat-blur-image',
    );
    const replyBlurImage = within(
      screen.getByTestId('routine-proof-chat-reply-message'),
    ).getByTestId('routine-proof-chat-blur-image');

    expect(requestBlurImage.props).toEqual(
      expect.objectContaining({ resizeMode: 'stretch' }),
    );
    expect(requestBlurImage.props.source).not.toEqual(
      replyBlurImage.props.source,
    );
  });

  it('메시지 원문이 있어도 플래그가 false이면 메시지를 표시하지 않는다', async () => {
    const mockDetail = createMockRoutineDetail(0, {
      imagePaths: [],
      message: '요청 원문',
    });

    mockAxios.onGet(/\/routine\/confirm\/detail/).reply(200, {
      data: {
        ...mockDetail,
        checkComment: '응답 원문',
        hasRequestMessage: false,
        hasResponseComment: false,
      },
    });

    const screen = render(<RoutineProofDetailModal />);

    expect(await screen.findByText('테스트 루틴 1')).toBeOnTheScreen();
    expect(screen.queryByText('요청 원문')).toBeNull();
    expect(screen.queryByText('응답 원문')).toBeNull();
    expect(screen.queryByText('주고받은 메시지')).toBeNull();
  });

  it('친구 인증 조회 권한이 없으면 빈 화면 대신 API 오류를 표시한다', async () => {
    mockAxios.onGet(/\/routine\/confirm\/detail/).reply(403, {
      success: false,
      error: {
        code: 'ROUTINE_CONFIRM_ACCESS_DENIED',
        message: '해당 인증 요청을 조회할 권한이 없습니다.',
        data: [],
      },
    });

    const screen = render(<RoutineProofDetailModal />);

    expect(
      await screen.findByTestId('routine-proof-detail-error'),
    ).toBeOnTheScreen();
    expect(
      screen.getByText('해당 인증 요청을 조회할 권한이 없습니다.'),
    ).toBeOnTheScreen();
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

  it('응답에 imagePaths가 없으면 imagePath를 대표 인증 사진으로 표시한다', async () => {
    const imagePath = 'https://example.com/representative-image.jpg';
    const mockDetail = createMockRoutineDetail(0, { imagePaths: [] });

    mockAxios.onGet(/\/routine\/confirm\/detail/).reply(200, {
      data: { ...mockDetail, imagePath },
    });

    const screen = render(<RoutineProofDetailModal />);

    expect(
      await screen.findByTestId('routine-proof-image-0'),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId('routine-proof-image-0').findByType(Image).props
        .source,
    ).toEqual({ uri: imagePath });
  });

  it('인증 사진을 원본 비율이 유지되는 contain 방식으로 표시한다', async () => {
    const mockDetail = createMockRoutineDetail(0, {
      imagePaths: ['https://example.com/image-1.jpg'],
    });

    mockAxios.onGet(/\/routine\/confirm\/detail/).reply(200, {
      data: mockDetail,
    });

    const screen = render(<RoutineProofDetailModal />);

    expect(
      (await screen.findByTestId('routine-proof-image-0')).findByType(Image)
        .props.resizeMode,
    ).toBe('contain');
  });

  it('인증 사진을 썸네일 영역 전체에서 중앙 정렬한다', async () => {
    const mockDetail = createMockRoutineDetail(0, {
      imagePaths: ['https://example.com/image-1.jpg'],
    });

    mockAxios.onGet(/\/routine\/confirm\/detail/).reply(200, {
      data: mockDetail,
    });

    const screen = render(<RoutineProofDetailModal />);
    const image = (
      await screen.findByTestId('routine-proof-image-0')
    ).findByType(Image);
    const imageStyle = NativeStyleSheet.flatten(image.props.style);

    expect(imageStyle).toMatchObject({ width: '100%', height: '100%' });
    expect(imageStyle.aspectRatio).toBeUndefined();
  });

  it('인증 응답 메시지에 응답자 닉네임을 표시한다', () => {
    mockRequestStore.requestId = 0;
    const previewDetail = {
      ...createMockRoutineDetail(0, {
        nickname: '요청자',
        requesterNickname: '요청자',
      }),
      responderNickname: '메이트',
      checkComment: '잘했어!',
      checkedAt: '2026-08-08T12:10:00',
      hasRequestMessage: false,
      hasResponseComment: true,
    };

    const screen = render(
      <RoutineProofDetailModal
        previewCurrentNickname="요청자"
        previewDetail={previewDetail}
      />,
    );

    expect(
      screen.getByTestId('routine-proof-chat-nickname-메이트'),
    ).toHaveTextContent('메이트');
  });

  it('현재 사용자가 응답자여도 내 메시지를 먼저 표시한다', () => {
    mockRequestStore.requestId = 0;
    const previewDetail = {
      ...createMockRoutineDetail(0, {
        requesterNickname: '메이트',
        message: null,
      }),
      responderNickname: '나',
      checkComment: null,
      hasRequestMessage: true,
      hasResponseComment: true,
    };

    const screen = render(
      <RoutineProofDetailModal
        previewCurrentNickname="나"
        previewDetail={previewDetail}
      />,
    );

    expect(
      screen
        .getAllByTestId(/routine-proof-chat-(request|reply)-message/)
        .map((message) => message.props.testID),
    ).toEqual([
      'routine-proof-chat-reply-message',
      'routine-proof-chat-request-message',
    ]);
  });
});
