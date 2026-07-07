import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { ActivityIndicator, ScrollView } from 'react-native';

import RequestModal from '../../../components/modal/request-modal';
import { SHOW_SCROLL_INDICATOR } from '../../../constants/SCROLL_INDICATOR';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockRoutine } from '../../setup/routine/mock';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;
declare const mockDismissTo: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;
declare const mockRoutineStore: {
  type: 'number' | 'week';
  setType: jest.Mock;
  routineId: number;
  setRoutineId: jest.Mock;
};
declare const mockShowToast: jest.Mock;

// ImagePicker mock
const mockLaunchImageLibraryAsync = jest.fn();
const mockLaunchCameraAsync = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockRequestCameraPermissionsAsync = jest.fn();
const mockGetPendingRoutineShare = jest.fn();
const mockClearPendingRoutineShare = jest.fn();

jest.mock('@/share/routine-share', () => ({
  getPendingRoutineShare: (...args: unknown[]) =>
    mockGetPendingRoutineShare(...args),
  clearPendingRoutineShare: (...args: unknown[]) =>
    mockClearPendingRoutineShare(...args),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: () =>
    mockRequestMediaLibraryPermissionsAsync(),
  requestCameraPermissionsAsync: () => mockRequestCameraPermissionsAsync(),
  launchImageLibraryAsync: (options: unknown) =>
    mockLaunchImageLibraryAsync(options),
  launchCameraAsync: (options: unknown) => mockLaunchCameraAsync(options),
}));

// axios mock adapter
let mockAxios: MockAdapter;

describe('RequestModal (루틴 인증 요청 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockRoutineStore.routineId = 1;
    mockShowToast.mockClear();
    mockPush.mockClear();
    for (const key of Object.keys(mockSearchParams)) {
      delete mockSearchParams[key];
    }

    // ImagePicker mock 초기화
    mockLaunchImageLibraryAsync.mockClear();
    mockLaunchCameraAsync.mockClear();
    mockRequestMediaLibraryPermissionsAsync.mockClear();
    mockRequestCameraPermissionsAsync.mockClear();
    mockGetPendingRoutineShare.mockReset();
    mockClearPendingRoutineShare.mockReset();
    mockGetPendingRoutineShare.mockResolvedValue(null);

    // 기본 권한 설정 (granted)
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    mockRequestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // 이미지 선택 헬퍼 함수
  const createPickedAssets = (images = ['test-base64-image-data']) =>
    images.map((base64) => ({
      base64,
      uri: `file:///${base64}.jpg`,
    }));

  const selectImageFromGallery = async (
    getByTestId: (testId: string) => any,
    images = ['test-base64-image-data'],
  ) => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: createPickedAssets(images),
    });

    const galleryButton = getByTestId('gallery-button');

    await act(async () => {
      fireEvent.press(galleryButton);
    });
  };

  describe('루틴 정보 표시 테스트', () => {
    beforeEach(() => {
      const mockRoutine = createMockRoutine(0, { isMe: true });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
    });

    it('루틴 이름이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestModal />);

      expect(await findByText('테스트 루틴 1')).toBeOnTheScreen();
    });

    it('루틴 상세 설명이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestModal />);

      expect(await findByText('테스트 루틴 1 상세')).toBeOnTheScreen();
    });

    it('루틴 이름 라벨이 표시된다', async () => {
      const { findByText } = render(<RequestModal />);

      expect(await findByText('루틴 이름')).toBeOnTheScreen();
    });

    it('인증 대상 라벨이 표시된다', async () => {
      const { findByText } = render(<RequestModal />);

      expect(await findByText('인증 대상')).toBeOnTheScreen();
    });

    it('스크롤은 가능하지만 스크롤 UI는 표시하지 않는다', async () => {
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      const scrollView = screen.UNSAFE_getByType(ScrollView);

      expect(scrollView.props.showsVerticalScrollIndicator).toBe(
        SHOW_SCROLL_INDICATOR,
      );
    });
  });

  describe('인증 대상 표시 테스트', () => {
    it('나에게 인증하는 루틴인 경우 "나"가 표시된다', async () => {
      const mockRoutine = createMockRoutine(0, { isMe: true });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });

      const { findByText } = render(<RequestModal />);

      await findByText('테스트 루틴 1');
      expect(await findByText('나')).toBeOnTheScreen();
    });

    it('친구에게 인증하는 루틴인 경우 메이트 닉네임이 표시된다', async () => {
      const mockRoutine = createMockRoutine(0, {
        isMe: false,
        mateNickname: 'friend123',
      });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });

      const { findByText } = render(<RequestModal />);

      await findByText('테스트 루틴 1');
      expect(await findByText('friend123')).toBeOnTheScreen();
    });
  });

  describe('이미지 업로드 유효성 검사 테스트', () => {
    beforeEach(() => {
      const mockRoutine = createMockRoutine(0, { isMe: true });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
    });

    it('이미지를 업로드하지 않으면 요청 버튼이 비활성화되어 있다', async () => {
      const { findByText, getByText } = render(<RequestModal />);

      // 루틴 정보가 로드될 때까지 대기
      await findByText('테스트 루틴 1');

      const submitButton = getByText('요청');

      expect(submitButton).toBeDisabled();
    });

    it('이미지를 업로드하면 요청 버튼이 활성화된다', async () => {
      const { findByText, getByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId);

      await waitFor(() => {
        const submitButton = getByText('요청');

        expect(submitButton).toBeEnabled();
      });
    });

    it('갤러리에서 이미지를 최대 3개까지 선택할 수 있다', async () => {
      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId, [
        'test-base64-image-data-1',
        'test-base64-image-data-2',
        'test-base64-image-data-3',
      ]);

      expect(mockLaunchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsMultipleSelection: true,
          selectionLimit: 3,
        }),
      );
    });

    it('선택한 이미지 3개의 미리보기를 표시한다', async () => {
      const { findByText, getAllByTestId, getByTestId } = render(
        <RequestModal />,
      );

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId, [
        'test-base64-image-data-1',
        'test-base64-image-data-2',
        'test-base64-image-data-3',
      ]);

      await waitFor(() => {
        expect(getAllByTestId('request-image-preview')).toHaveLength(3);
      });
    });

    it('미리보기는 선택한 이미지의 로컬 uri를 사용한다', async () => {
      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId);

      await waitFor(() => {
        expect(getByTestId('request-image-preview')).toHaveProp('source', {
          uri: 'file:///test-base64-image-data.jpg',
        });
      });
    });

    it('미리보기 이미지는 명시적인 크기를 가진다', async () => {
      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId);

      await waitFor(() => {
        expect(getByTestId('request-image-preview')).toHaveStyle({
          width: 100,
          height: 100,
        });
      });
    });

    it('공유 세션 이미지가 있으면 미리 첨부된 상태로 표시한다', async () => {
      mockSearchParams.shareSessionId = 'session-1';
      mockGetPendingRoutineShare.mockResolvedValue({
        sessionId: 'session-1',
        routineId: 1,
        createdAt: '2026-05-29T00:00:00.000Z',
        images: [
          {
            base64: 'shared-base64-image-data',
            previewUri: 'file:///shared-image.jpg',
          },
        ],
      });

      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await waitFor(() => {
        expect(mockGetPendingRoutineShare).toHaveBeenCalledWith('session-1');
        expect(getByTestId('request-image-preview')).toHaveProp('source', {
          uri: 'file:///shared-image.jpg',
        });
        expect(mockClearPendingRoutineShare).toHaveBeenCalledWith('session-1');
      });
    });

    it('갤러리를 다시 열어 선택하면 기존 이미지에 새 이미지를 추가한다', async () => {
      const { findByText, getAllByTestId, getByTestId } = render(
        <RequestModal />,
      );

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId, ['test-base64-image-data-1']);
      await selectImageFromGallery(getByTestId, ['test-base64-image-data-2']);

      await waitFor(() => {
        expect(getAllByTestId('request-image-preview')).toHaveLength(2);
      });
    });

    it('이미지를 다시 추가할 때 남은 개수만 선택할 수 있다', async () => {
      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId, [
        'test-base64-image-data-1',
        'test-base64-image-data-2',
      ]);
      await selectImageFromGallery(getByTestId, ['test-base64-image-data-3']);

      expect(mockLaunchImageLibraryAsync).toHaveBeenLastCalledWith(
        expect.objectContaining({
          selectionLimit: 1,
        }),
      );
    });

    it('미리보기의 x 버튼을 누르면 해당 이미지를 제거한다', async () => {
      const { findByText, getAllByTestId, getByTestId, queryByTestId } = render(
        <RequestModal />,
      );

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId, [
        'test-base64-image-data-1',
        'test-base64-image-data-2',
      ]);

      await waitFor(() => {
        expect(getAllByTestId('request-image-preview')).toHaveLength(2);
      });

      await act(async () => {
        fireEvent.press(getByTestId('remove-request-image-0'));
      });

      await waitFor(() => {
        expect(getAllByTestId('request-image-preview')).toHaveLength(1);
        expect(queryByTestId('remove-request-image-1')).not.toBeOnTheScreen();
      });
    });
  });

  describe('API 통합 테스트', () => {
    describe('인증 요청 성공 시 (나에게 인증하는 루틴)', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0, { isMe: true });

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onPost('/routine/confirm').reply(200, { data: null });
      });

      it('인증 완료 Toast가 표시되고 루틴 페이지로 이동한다', async () => {
        const { findByText, getByText, getByTestId } = render(<RequestModal />);

        await findByText('테스트 루틴 1');

        await selectImageFromGallery(getByTestId);

        await waitFor(() => {
          expect(getByText('요청')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('요청'));
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '인증이 완료되었습니다.',
            'success',
          );
          expect(mockDismissTo).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });

      it('선택한 이미지 3개를 인증 요청에 포함한다', async () => {
        const expectedImages = [
          'test-base64-image-data-1',
          'test-base64-image-data-2',
          'test-base64-image-data-3',
        ];
        let submittedFormData: FormData | undefined;

        mockAxios.resetHandlers();
        mockAxios.onGet(/\/routine\/details/).reply(200, {
          data: createMockRoutine(0, { isMe: true }),
        });
        mockAxios.onPost('/routine/confirm').reply((config) => {
          submittedFormData = config.data as FormData;

          return [200, { data: null }];
        });

        const { findByText, getByText, getByTestId } = render(<RequestModal />);

        await findByText('테스트 루틴 1');

        await selectImageFromGallery(getByTestId, expectedImages);

        await waitFor(() => {
          expect(getByText('요청')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('요청'));
        });

        await waitFor(() => {
          expect(submittedFormData?.getAll('base64images')).toEqual(
            expectedImages,
          );
        });
      });

      it('요청 중에는 스피너를 표시하고 취소, 요청, 이미지 업로드 버튼을 비활성화한다', async () => {
        let resolveRequest: () => void = () => {};

        mockAxios.resetHandlers();
        mockAxios.onGet(/\/routine\/details/).reply(200, {
          data: createMockRoutine(0, { isMe: true }),
        });
        mockAxios.onPost('/routine/confirm').reply(
          () =>
            new Promise((resolve) => {
              resolveRequest = () => resolve([200, { data: null }]);
            }),
        );

        const screen = render(<RequestModal />);

        await screen.findByText('테스트 루틴 1');

        await selectImageFromGallery(screen.getByTestId);

        await waitFor(() => {
          expect(screen.getByText('요청')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(screen.getByText('요청'));
        });

        await waitFor(() => {
          expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
          expect(screen.getByText('취소')).toBeDisabled();
          expect(screen.getByTestId('request-submit-button')).toBeDisabled();
          expect(screen.getByTestId('gallery-button')).toBeDisabled();
          expect(screen.getByTestId('camera-button')).toBeDisabled();
          expect(screen.getByTestId('remove-request-image-0')).toBeDisabled();
        });

        expect(screen.queryByText('요청')).not.toBeOnTheScreen();

        await act(async () => {
          resolveRequest();
        });

        await waitFor(() => {
          expect(mockDismissTo).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });
    });

    describe('인증 요청 성공 시 (친구에게 인증하는 루틴)', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0, {
          isMe: false,
          mateNickname: 'friend123',
        });

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onPost('/routine/confirm').reply(200, { data: null });
      });

      it('인증 요청 완료 Toast가 표시되고 루틴 페이지로 이동한다', async () => {
        const { findByText, getByText, getByTestId } = render(<RequestModal />);

        await findByText('테스트 루틴 1');

        await selectImageFromGallery(getByTestId);

        await waitFor(() => {
          expect(getByText('요청')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('요청'));
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '인증 요청이 완료되었습니다.',
            'success',
          );
          expect(mockDismissTo).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });
    });

    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0, { isMe: true });

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onPost('/routine/confirm').reply(500, {
          error: {
            message: '서버 오류가 발생했습니다.',
          },
        });
      });

      it('에러 Toast가 표시된다', async () => {
        const { findByText, getByText, getByTestId } = render(<RequestModal />);

        await findByText('테스트 루틴 1');

        await selectImageFromGallery(getByTestId);

        await waitFor(() => {
          expect(getByText('요청')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('요청'));
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '서버 오류가 발생했습니다.',
            'error',
          );
        });
      });
    });

    describe('413 에러 발생 시 (파일 용량 초과)', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0, { isMe: true });

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onPost('/routine/confirm').reply(413, {
          error: {
            message: '파일 용량 초과',
          },
        });
      });

      it('용량 초과 에러 Toast가 표시된다', async () => {
        const { findByText, getByText, getByTestId } = render(<RequestModal />);

        await findByText('테스트 루틴 1');

        await selectImageFromGallery(getByTestId);

        await waitFor(() => {
          expect(getByText('요청')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('요청'));
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '용량은 1MB 이하만 업로드 가능합니다.',
            'error',
          );
        });
      });
    });

    describe('네트워크 에러 발생 시', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0, { isMe: true });

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onPost('/routine/confirm').networkError();
      });

      it('기본 에러 Toast가 표시된다', async () => {
        const { findByText, getByText, getByTestId } = render(<RequestModal />);

        await findByText('테스트 루틴 1');

        await selectImageFromGallery(getByTestId);

        await waitFor(() => {
          expect(getByText('요청')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('요청'));
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '인증 요청에 실패했습니다. 다시 시도해주세요.',
            'error',
          );
        });
      });
    });

    describe('일시정지된 루틴인 경우', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0, {
          isMe: true,
          paused: true,
        });

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onPost('/routine/confirm').reply(200, { data: null });
      });

      it('인증 요청을 보내지 않고 일시정지 안내 Toast를 표시한다', async () => {
        const { findByText, getByText, getByTestId } = render(<RequestModal />);

        await findByText('테스트 루틴 1');

        await selectImageFromGallery(getByTestId);

        await waitFor(() => {
          expect(getByText('요청')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('요청'));
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '일시정지된 루틴은 인증 요청을 보낼 수 없습니다.',
            'error',
          );
        });
        expect(mockAxios.history.post).toHaveLength(0);
      });
    });
  });

  describe('나/친구 인증 분기 처리 테스트', () => {
    it('isMe가 true인 경우 인증 완료 메시지가 표시된다', async () => {
      const mockRoutine = createMockRoutine(0, { isMe: true });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
      mockAxios.onPost('/routine/confirm').reply(200, { data: null });

      const { findByText, getByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId);

      await waitFor(() => {
        expect(getByText('요청')).toBeEnabled();
      });

      await act(async () => {
        fireEvent.press(getByText('요청'));
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          '인증이 완료되었습니다.',
          'success',
        );
      });
    });

    it('isMe가 false인 경우 인증 요청 완료 메시지가 표시된다', async () => {
      const mockRoutine = createMockRoutine(0, { isMe: false });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
      mockAxios.onPost('/routine/confirm').reply(200, { data: null });

      const { findByText, getByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId);

      await waitFor(() => {
        expect(getByText('요청')).toBeEnabled();
      });

      await act(async () => {
        fireEvent.press(getByText('요청'));
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          '인증 요청이 완료되었습니다.',
          'success',
        );
      });
    });
  });

  describe('취소 버튼 테스트', () => {
    beforeEach(() => {
      const mockRoutine = createMockRoutine(0, { isMe: true });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
    });

    it('취소 버튼이 화면에 표시된다', async () => {
      const { findByText, getByText } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      const cancelButton = getByText('취소');

      expect(cancelButton).toBeOnTheScreen();
    });
  });
});
