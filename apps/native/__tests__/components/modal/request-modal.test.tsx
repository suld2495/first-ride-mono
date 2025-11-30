import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import RequestModal from '../../../components/modal/RequestModal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockRoutine } from '../../setup/routine/mock';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;
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

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: () =>
    mockRequestMediaLibraryPermissionsAsync(),
  requestCameraPermissionsAsync: () => mockRequestCameraPermissionsAsync(),
  launchImageLibraryAsync: () => mockLaunchImageLibraryAsync(),
  launchCameraAsync: () => mockLaunchCameraAsync(),
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

    // ImagePicker mock 초기화
    mockLaunchImageLibraryAsync.mockClear();
    mockLaunchCameraAsync.mockClear();
    mockRequestMediaLibraryPermissionsAsync.mockClear();
    mockRequestCameraPermissionsAsync.mockClear();

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
  const selectImageFromGallery = async (
    getByTestId: (testId: string) => any,
  ) => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ base64: 'test-base64-image-data' }],
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
          expect(mockPush).toHaveBeenCalledWith(
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
          expect(mockPush).toHaveBeenCalledWith(
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
