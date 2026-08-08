import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';

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
const mockManipulateAsync = jest.fn();
const mockGetInfoAsync = jest.fn();

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

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: (...args: unknown[]) => mockManipulateAsync(...args),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
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
    mockManipulateAsync.mockReset();
    mockGetInfoAsync.mockReset();
    mockGetPendingRoutineShare.mockResolvedValue(null);
    mockManipulateAsync.mockImplementation(async (uri: string) => ({
      uri: uri
        .replace('file:///', 'file:///normalized/')
        .replace(/\.[^.]+$/, '.jpg'),
      width: 1_200,
      height: 800,
    }));
    mockGetInfoAsync.mockResolvedValue({ exists: true, size: 512_000 });

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
  const createPickedAssets = (images = ['test-image-data']) =>
    images.map((image) => ({
      uri: `file:///${image}.heic`,
      width: 1_200,
      height: 800,
    }));

  const selectImageFromGallery = async (
    getByTestId: (testId: string) => any,
    images = ['test-image-data'],
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

    it('루틴 이름과 설명이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestModal />);

      expect(await findByText('테스트 루틴 1')).toBeOnTheScreen();
      expect(await findByText('테스트 루틴 1 상세')).toBeOnTheScreen();
    });

    it('이미지 추가 방법을 텍스트 버튼으로 표시한다', async () => {
      const { findByText } = render(<RequestModal />);

      expect(await findByText('앨범에서 선택')).toBeOnTheScreen();
      expect(await findByText('카메라로 촬영')).toBeOnTheScreen();
    });

    it('혼자 인증하는 루틴은 루틴 요약 영역만 표시한다', async () => {
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      expect(screen.getByTestId('request-summary')).toHaveStyle({
        flexDirection: 'row',
        minHeight: 96,
      });
      expect(screen.queryByTestId('request-summary-divider')).toBeNull();
      expect(screen.queryByTestId('request-target-summary')).toBeNull();
      expect(screen.getByTestId('request-routine-summary')).toHaveStyle({
        width: '100%',
      });
    });

    it('빈 이미지 스테이지에 세 개의 미리보기 자리를 위로 당겨 표시한다', async () => {
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      expect(screen.getByTestId('request-form-content')).toHaveStyle({
        paddingHorizontal: 18,
      });
      expect(screen.getByTestId('request-media-stage')).toHaveStyle({
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        borderWidth: 0,
      });
      expect(screen.queryByTestId('request-empty-image-area')).toBeNull();
      expect(screen.queryByTestId('request-empty-image-button')).toBeNull();
      expect(screen.queryByTestId('request-empty-image-icon')).toBeNull();
      expect(screen.queryByText('사진을 추가해 주세요')).toBeNull();
      expect(screen.getByText('인증 사진')).toHaveStyle({
        fontSize: 14,
      });
      expect(screen.queryByText('0/3')).toBeNull();
      const imageSlots = screen.getAllByTestId('request-image-slot');

      expect(imageSlots).toHaveLength(3);
      expect(imageSlots[0]).toHaveStyle({
        borderColor: '#D0D4DB',
        borderWidth: 1,
        height: 80,
        width: 96,
      });
      for (const slotIcon of screen.getAllByTestId('request-image-slot-icon')) {
        expect(slotIcon).toHaveProp('size', 28);
      }
    });

    it('앨범과 카메라 액션을 이미지 스테이지의 도구막대에 묶는다', async () => {
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      expect(screen.getByTestId('request-image-actions')).toHaveStyle({
        flexDirection: 'row',
        minHeight: 60,
      });
      expect(screen.getByText('앨범에서 선택')).toHaveStyle({
        fontSize: 13,
      });
      expect(screen.getByText('카메라로 촬영')).toHaveStyle({
        fontSize: 13,
      });
      expect(screen.getByTestId('gallery-button')).toBeOnTheScreen();
      expect(screen.getByTestId('camera-button')).toBeOnTheScreen();
    });

    it('취소와 인증 액션을 모달 고정 푸터에 표시한다', async () => {
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      expect(screen.getByTestId('modal-footer')).toBeOnTheScreen();
      expect(screen.getByTestId('request-form-button-container')).toHaveStyle({
        paddingHorizontal: 24,
        borderTopColor: '#A7CBEA',
      });
      expect(screen.getByTestId('request-cancel-button')).toHaveStyle({
        backgroundColor: '#E2F1FF',
        width: 140,
      });
      expect(screen.getByTestId('request-submit-button')).toHaveStyle({
        backgroundColor: '#A7CBEA',
        opacity: 1,
      });
      expect(screen.getByText('취소')).toBeOnTheScreen();
      expect(screen.getByText('취소')).toHaveStyle({ fontSize: 16 });
      expect(screen.getByText('인증')).toHaveStyle({ fontSize: 16 });
      expect(screen.getByText('인증')).toBeDisabled();
    });

    it('루틴 설명 라벨과 상세 내용을 표시한다', async () => {
      const { findByText } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      expect(await findByText('루틴 설명')).toBeOnTheScreen();
      expect(await findByText('테스트 루틴 1 상세')).toBeOnTheScreen();
    });

    it('루틴 이름 라벨이 표시된다', async () => {
      const { findByText } = render(<RequestModal />);

      expect(await findByText('루틴 이름')).toBeOnTheScreen();
    });

    it('인증 메시지를 textarea에 입력할 수 있다', async () => {
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      const messageInput =
        screen.getByPlaceholderText('메이트에게 남길 한 줄 메시지');

      fireEvent.changeText(messageInput, '오늘도 루틴 완료!');

      expect(screen.getByText('메시지')).toBeOnTheScreen();
      expect(screen.getByText('(선택)')).toBeOnTheScreen();
      expect(messageInput).toHaveProp('maxLength', 100);
      expect(messageInput).toHaveProp('multiline', true);
      expect(messageInput).toHaveStyle({
        minHeight: 80,
        textAlignVertical: 'top',
      });
      expect(messageInput).toHaveProp('value', '오늘도 루틴 완료!');
      expect(screen.getByTestId('request-message-section')).toHaveStyle({
        marginTop: 16,
      });
    });

    it('혼자 인증하는 루틴은 인증 대상 라벨을 표시하지 않는다', async () => {
      const { findByText, queryByText } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      expect(queryByText('인증 대상')).not.toBeOnTheScreen();
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
    it('나에게 인증하는 루틴인 경우 인증 대상을 표시하지 않는다', async () => {
      const mockRoutine = createMockRoutine(0, { isMe: true });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });

      const { findByText, queryByText, queryByTestId } = render(
        <RequestModal />,
      );

      await findByText('테스트 루틴 1');
      expect(queryByText('인증 대상')).not.toBeOnTheScreen();
      expect(queryByText('나')).not.toBeOnTheScreen();
      expect(
        queryByText('메이트에게 루틴 인증 요청을 보냅니다.'),
      ).not.toBeOnTheScreen();
      expect(queryByTestId('request-target-summary')).not.toBeOnTheScreen();
    });

    it('친구에게 인증하는 루틴인 경우 메이트 닉네임이 표시된다', async () => {
      const mockRoutine = createMockRoutine(0, {
        isMe: false,
        mateNickname: 'friend123',
      });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });

      const { findByText, getByTestId, queryByTestId, queryByText } = render(
        <RequestModal />,
      );

      await findByText('테스트 루틴 1');
      expect(await findByText('인증 대상')).toBeOnTheScreen();
      expect(await findByText('friend123')).toBeOnTheScreen();
      expect(
        queryByText('메이트에게 루틴 인증 요청을 보냅니다.'),
      ).not.toBeOnTheScreen();
      expect(queryByTestId('request-mate-help')).toBeNull();
      expect(getByTestId('request-summary-divider')).toHaveStyle({
        height: 36,
      });
      expect(getByTestId('request-target-summary')).toHaveStyle({
        flex: 1,
      });
    });
  });

  describe('이미지 업로드 유효성 검사 테스트', () => {
    beforeEach(() => {
      const mockRoutine = createMockRoutine(0, { isMe: true });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
    });

    it('이미지를 업로드하지 않으면 인증 버튼이 비활성화되어 있다', async () => {
      const { findByText, getByText } = render(<RequestModal />);

      // 루틴 정보가 로드될 때까지 대기
      await findByText('테스트 루틴 1');

      const submitButton = getByText('인증');

      expect(submitButton).toBeDisabled();
    });

    it('이미지를 업로드하면 인증 버튼이 활성화된다', async () => {
      const { findByText, getByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId);

      await waitFor(() => {
        const submitButton = getByText('인증');

        expect(submitButton).toBeEnabled();
      });
    });

    it('이미지 한 장을 업로드해도 선택 개수 텍스트는 표시하지 않는다', async () => {
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');
      await selectImageFromGallery(screen.getByTestId);

      await waitFor(() => {
        expect(screen.queryByText('1/3')).toBeNull();
        expect(screen.getAllByTestId('request-image-slot')).toHaveLength(3);
        expect(screen.getAllByTestId('request-image-preview')).toHaveLength(1);
      });
    });

    it('카메라로 촬영한 이미지 한 장을 미리보기에 추가한다', async () => {
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: createPickedAssets(['camera-image-data']),
      });
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(screen.getByTestId('camera-button'));
      });

      expect(mockLaunchCameraAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsMultipleSelection: false,
          mediaTypes: ['images'],
        }),
      );
      expect(mockLaunchCameraAsync.mock.calls[0]?.[0]).not.toHaveProperty(
        'base64',
      );
      await waitFor(() => {
        expect(screen.queryByText('1/3')).toBeNull();
        expect(screen.getByTestId('request-image-preview')).toHaveProp(
          'source',
          { uri: 'file:///normalized/camera-image-data.jpg' },
        );
      });
    });

    it('사진 권한이 없으면 설정 안내를 표시하고 선택기를 열지 않는다', async () => {
      const alertSpy = jest
        .spyOn(Alert, 'alert')
        .mockImplementation(() => undefined);
      mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(screen.getByTestId('gallery-button'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Photos permission not granted',
        'Please grant Photos permission to use this feature',
        expect.any(Array),
      );
      expect(mockLaunchImageLibraryAsync).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('갤러리에서 이미지를 최대 3개까지 선택할 수 있다', async () => {
      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId, [
        'test-image-data-1',
        'test-image-data-2',
        'test-image-data-3',
      ]);

      expect(mockLaunchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsMultipleSelection: true,
          selectionLimit: 3,
        }),
      );
    });

    it('선택한 이미지 3개의 미리보기를 표시한다', async () => {
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');

      await selectImageFromGallery(screen.getByTestId, [
        'test-image-data-1',
        'test-image-data-2',
        'test-image-data-3',
      ]);

      await waitFor(() => {
        expect(screen.getAllByTestId('request-image-preview')).toHaveLength(3);
        expect(
          screen.queryByTestId('request-empty-image-button'),
        ).not.toBeOnTheScreen();
        expect(
          screen.queryByText('사진을 추가해 주세요'),
        ).not.toBeOnTheScreen();
      });
    });

    it('미리보기는 선택한 이미지의 로컬 uri를 사용한다', async () => {
      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId);

      await waitFor(() => {
        expect(getByTestId('request-image-preview')).toHaveProp('source', {
          uri: 'file:///normalized/test-image-data.jpg',
        });
      });
    });

    it('미리보기 이미지는 명시적인 크기를 가진다', async () => {
      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId);

      await waitFor(() => {
        expect(getByTestId('request-image-preview')).toHaveStyle({
          width: 96,
          height: 80,
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
            uri: 'file:///shared-image.heic',
          },
        ],
      });

      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await waitFor(() => {
        expect(mockGetPendingRoutineShare).toHaveBeenCalledWith('session-1');
        expect(getByTestId('request-image-preview')).toHaveProp('source', {
          uri: 'file:///normalized/shared-image.jpg',
        });
        expect(mockClearPendingRoutineShare).toHaveBeenCalledWith('session-1');
      });
    });

    it('갤러리를 다시 열어 선택하면 기존 이미지에 새 이미지를 추가한다', async () => {
      const { findByText, getAllByTestId, getByTestId } = render(
        <RequestModal />,
      );

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId, ['test-image-data-1']);
      await selectImageFromGallery(getByTestId, ['test-image-data-2']);

      await waitFor(() => {
        expect(getAllByTestId('request-image-preview')).toHaveLength(2);
      });
    });

    it('같은 이미지를 다시 선택하면 중복으로 추가하지 않는다', async () => {
      mockManipulateAsync
        .mockResolvedValueOnce({
          uri: 'file:///normalized/same-image-1.jpg',
          width: 1_200,
          height: 800,
        })
        .mockResolvedValueOnce({
          uri: 'file:///normalized/same-image-2.jpg',
          width: 1_200,
          height: 800,
        });
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');
      await selectImageFromGallery(screen.getByTestId, ['same-image']);
      await selectImageFromGallery(screen.getByTestId, ['same-image']);

      await waitFor(() => {
        expect(screen.getAllByTestId('request-image-preview')).toHaveLength(1);
        expect(screen.queryByText('1/3')).toBeNull();
      });
    });

    it('이미지를 다시 추가할 때 남은 개수만 선택할 수 있다', async () => {
      const { findByText, getByTestId } = render(<RequestModal />);

      await findByText('테스트 루틴 1');

      await selectImageFromGallery(getByTestId, [
        'test-image-data-1',
        'test-image-data-2',
      ]);
      await selectImageFromGallery(getByTestId, ['test-image-data-3']);

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
        'test-image-data-1',
        'test-image-data-2',
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

    it('변환할 수 없는 이미지는 미리보기에 넣지 않고 안내한다', async () => {
      mockManipulateAsync.mockRejectedValueOnce(new Error('unsupported'));
      const screen = render(<RequestModal />);

      await screen.findByText('테스트 루틴 1');
      await selectImageFromGallery(screen.getByTestId, ['invalid-image']);

      await waitFor(() => {
        expect(screen.queryByTestId('request-image-preview')).toBeNull();
        expect(screen.queryByText('0/3')).toBeNull();
        expect(mockShowToast).toHaveBeenCalledWith(
          '업로드할 수 없는 이미지는 제외했습니다.',
          'error',
        );
      });
    });
  });

  describe('API 통합 테스트', () => {
    describe('사진이 선택사항인 셀프 루틴', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0, {
          isMe: true,
          photoRequired: false,
        });

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onPost('/routine/confirm').reply(200, { data: null });
      });

      it('이미지 없이 인증 버튼을 활성화하고 요청을 전송한다', async () => {
        const appendSpy = jest.spyOn(FormData.prototype, 'append');
        const screen = render(<RequestModal />);

        await screen.findByText('테스트 루틴 1');

        expect(screen.getByTestId('request-photo-optional-label')).toHaveTextContent(
          '선택',
        );
        expect(screen.getByText('인증')).toBeEnabled();

        await act(async () => {
          fireEvent.press(screen.getByText('인증'));
        });

        await waitFor(() => {
          expect(mockAxios.history.post).toHaveLength(1);
          expect(appendSpy).toHaveBeenCalledWith('routineId', '1');
          expect(appendSpy).not.toHaveBeenCalledWith(
            'images',
            expect.anything(),
          );
          expect(mockShowToast).toHaveBeenCalledWith(
            '인증이 완료되었습니다.',
            'success',
          );
        });

        appendSpy.mockRestore();
      });
    });

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
          expect(getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('인증'));
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
        const selectedImages = [
          'test-image-data-1',
          'test-image-data-2',
          'test-image-data-3',
        ];
        const appendSpy = jest.spyOn(FormData.prototype, 'append');

        mockAxios.resetHandlers();
        mockAxios.onGet(/\/routine\/details/).reply(200, {
          data: createMockRoutine(0, { isMe: true }),
        });
        mockAxios.onPost('/routine/confirm').reply(() => {
          return [200, { data: null }];
        });

        const { findByText, getByText, getByTestId } = render(<RequestModal />);

        await findByText('테스트 루틴 1');

        await selectImageFromGallery(getByTestId, selectedImages);

        await waitFor(() => {
          expect(getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('인증'));
        });

        await waitFor(() => {
          for (const [index, image] of selectedImages.entries()) {
            expect(appendSpy).toHaveBeenCalledWith('images', {
              uri: `file:///normalized/${image}.jpg`,
              name: `routine-confirm-${index + 1}.jpg`,
              type: 'image/jpeg',
            });
          }
          expect(appendSpy).not.toHaveBeenCalledWith(
            'base64images',
            expect.anything(),
          );
          expect(appendSpy).toHaveBeenCalledWith('routineId', '1');
          expect(appendSpy).not.toHaveBeenCalledWith(
            'nickname',
            expect.anything(),
          );
        });

        appendSpy.mockRestore();
      });

      it('입력한 메시지를 인증 요청에 포함한다', async () => {
        const appendSpy = jest.spyOn(FormData.prototype, 'append');
        const screen = render(<RequestModal />);

        await screen.findByText('테스트 루틴 1');
        await selectImageFromGallery(screen.getByTestId);

        fireEvent.changeText(
          screen.getByPlaceholderText('메이트에게 남길 한 줄 메시지'),
          '오늘도 루틴 완료!',
        );

        await waitFor(() => {
          expect(screen.getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(screen.getByText('인증'));
        });

        await waitFor(() => {
          expect(appendSpy).toHaveBeenCalledWith(
            'message',
            '오늘도 루틴 완료!',
          );
        });

        appendSpy.mockRestore();
      });

      it('100자 초과 서버 에러 메시지를 표시한다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/routine\/details/).reply(200, {
          data: createMockRoutine(0, { isMe: true }),
        });
        mockAxios.onPost('/routine/confirm').reply(400, {
          success: false,
          error: {
            message: '인증 메시지는 100자 이하로 입력해주세요.',
          },
        });
        const screen = render(<RequestModal />);

        await screen.findByText('테스트 루틴 1');
        await selectImageFromGallery(screen.getByTestId);
        fireEvent.changeText(
          screen.getByPlaceholderText('메이트에게 남길 한 줄 메시지'),
          '메시지',
        );

        await act(async () => {
          fireEvent.press(screen.getByText('인증'));
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '인증 메시지는 100자 이하로 입력해주세요.',
            'error',
          );
        });
      });

      it('재렌더링 전에 인증 버튼을 연속으로 눌러도 요청을 한 번만 보낸다', async () => {
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
          expect(screen.getByText('인증')).toBeEnabled();
        });

        act(() => {
          fireEvent.press(screen.getByText('인증'));
          fireEvent.press(screen.getByText('인증'));
        });

        await waitFor(() => {
          expect(mockAxios.history.post).toHaveLength(1);
        });

        await act(async () => {
          resolveRequest();
        });

        await waitFor(() => {
          expect(mockDismissTo).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
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
          expect(screen.getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(screen.getByText('인증'));
        });

        await waitFor(() => {
          expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
          expect(screen.getByText('취소')).toBeDisabled();
          expect(screen.getByTestId('request-submit-button')).toBeDisabled();
          expect(screen.getByTestId('gallery-button')).toBeDisabled();
          expect(screen.getByTestId('camera-button')).toBeDisabled();
          expect(screen.getByTestId('remove-request-image-0')).toBeDisabled();
        });

        expect(screen.queryByText('인증')).not.toBeOnTheScreen();

        await act(async () => {
          resolveRequest();
        });

        await waitFor(() => {
          expect(mockDismissTo).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });

      it('이미지 업로드 진행률을 요청 사진 영역 아래에 표시하고 완료 시 100%로 유지한다', async () => {
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

        expect(
          screen.queryByTestId('request-upload-progress-track'),
        ).not.toBeOnTheScreen();

        await act(async () => {
          fireEvent.press(screen.getByText('인증'));
        });

        await waitFor(() => {
          expect(
            screen.getByTestId('request-upload-progress-track'),
          ).toBeOnTheScreen();
          expect(
            screen.getByTestId('request-upload-progress-fill'),
          ).toHaveStyle({ width: '0%' });
        });

        const requestConfig = mockAxios.history.post[0];

        act(() => {
          requestConfig?.onUploadProgress?.({
            loaded: 1,
            total: 4,
            progress: 0.25,
          } as never);
        });

        expect(screen.getByTestId('request-upload-progress-fill')).toHaveStyle({
          width: '25%',
        });

        act(() => {
          requestConfig?.onUploadProgress?.({
            loaded: 4,
            total: 4,
            progress: 1,
          } as never);
        });

        expect(screen.getByTestId('request-upload-progress-fill')).toHaveStyle({
          width: '100%',
        });
        expect(mockDismissTo).not.toHaveBeenCalled();

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
          expect(getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('인증'));
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
          expect(getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('인증'));
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
          expect(getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('인증'));
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '이미지는 1장당 10MB 이하로 업로드할 수 있습니다.',
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
          expect(getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('인증'));
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
          expect(getByText('인증')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('인증'));
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
        expect(getByText('인증')).toBeEnabled();
      });

      await act(async () => {
        fireEvent.press(getByText('인증'));
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
        expect(getByText('인증')).toBeEnabled();
      });

      await act(async () => {
        fireEvent.press(getByText('인증'));
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
