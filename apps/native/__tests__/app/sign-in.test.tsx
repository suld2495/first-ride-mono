import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import SignIn from '../../app/sign-in';
import { render } from '../setup/test-utils';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;

// setAuthorization, setRefreshToken mock
jest.mock('@/api', () => ({
  setAuthorization: jest.fn(),
  setRefreshToken: jest.fn(),
}));

// useNotifications mock
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    pushToken: { data: 'mock-push-token' },
  }),
}));

// axios mock adapter
let mockAxios: MockAdapter;

describe('SignIn 페이지', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // 버튼 찾기 헬퍼 함수 (제목이 아닌 버튼만 선택)
  const getSubmitButton = (getAllByText: (text: string) => any[]) => {
    const buttons = getAllByText('로그인');

    // 두 번째 요소가 버튼 (첫 번째는 제목)
    return buttons[1];
  };

  describe('유효성 검증 테스트', () => {
    it('모든 필드가 비어있을 때 로그인 버튼을 누르면 모든 필드에서 에러가 표시된다', async () => {
      const { getAllByText, findByText } = render(<SignIn />);

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      expect(await findByText('아이디를 입력해주세요.')).toBeOnTheScreen();
      expect(await findByText('비밀번호를 입력해주세요.')).toBeOnTheScreen();
    });

    it('아이디만 입력하고 로그인 버튼을 누르면 비밀번호 에러만 표시된다', async () => {
      const { getByPlaceholderText, getAllByText, findByText, queryByText } =
        render(<SignIn />);

      const userIdInput = getByPlaceholderText('아이디를 입력해주세요.');

      fireEvent.changeText(userIdInput, 'testuser');

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByText('아이디를 입력해주세요.')).not.toBeOnTheScreen();
      });
      expect(await findByText('비밀번호를 입력해주세요.')).toBeOnTheScreen();
    });

    it('비밀번호만 입력하고 로그인 버튼을 누르면 아이디 에러만 표시된다', async () => {
      const { getByPlaceholderText, getAllByText, findByText, queryByText } =
        render(<SignIn />);

      const passwordInput = getByPlaceholderText('비밀번호를 입력해주세요.');

      fireEvent.changeText(passwordInput, 'password123');

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByText('비밀번호를 입력해주세요.')).not.toBeOnTheScreen();
      });
      expect(await findByText('아이디를 입력해주세요.')).toBeOnTheScreen();
    });

    it('에러 상태에서 필드를 수정하면 해당 에러가 사라진다', async () => {
      const { getByPlaceholderText, getAllByText, findByText, queryByText } =
        render(<SignIn />);

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      expect(await findByText('아이디를 입력해주세요.')).toBeOnTheScreen();

      const userIdInput = getByPlaceholderText('아이디를 입력해주세요.');

      fireEvent.changeText(userIdInput, 'testuser');

      await waitFor(() => {
        expect(queryByText('아이디를 입력해주세요.')).not.toBeOnTheScreen();
      });
    });
  });

  describe('API 통합 테스트', () => {
    // 폼 입력 헬퍼 함수
    const fillForm = (
      getByPlaceholderText: (text: string) => any,
      data: {
        userId: string;
        password: string;
      },
    ) => {
      fireEvent.changeText(
        getByPlaceholderText('아이디를 입력해주세요.'),
        data.userId,
      );

      fireEvent.changeText(
        getByPlaceholderText('비밀번호를 입력해주세요.'),
        data.password,
      );
    };

    describe('로그인 성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(200, {
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            userInfo: {
              userId: 'testuser',
              nickname: 'testnick',
            },
          },
        });
      });

      it('루틴 페이지로 이동한다', async () => {
        const { getByPlaceholderText, getAllByText } = render(<SignIn />);

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });
    });

    describe('아이디/비밀번호 불일치 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(400, {
          error: {
            message: '아이디 또는 비밀번호가 일치하지 않습니다.',
          },
        });
      });

      it('에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText, findByText } = render(
          <SignIn />,
        );

        fillForm(getByPlaceholderText, {
          userId: 'wronguser',
          password: 'wrongpassword',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        expect(
          await findByText('아이디 또는 비밀번호가 일치하지 않습니다.'),
        ).toBeOnTheScreen();
      });
    });

    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(500, {
          error: {
            message: '서버 오류가 발생했습니다.',
          },
        });
      });

      it('기본 에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText, findByText } = render(
          <SignIn />,
        );

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        expect(await findByText('서버 오류가 발생했습니다.')).toBeOnTheScreen();
      });
    });

    describe('네트워크 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').networkError();
      });

      it('기본 에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText, findByText } = render(
          <SignIn />,
        );

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        expect(
          await findByText('로그인에 실패했습니다. 다시 시도해주세요.'),
        ).toBeOnTheScreen();
      });
    });

    describe('타임아웃 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').timeout();
      });

      it('기본 에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText, findByText } = render(
          <SignIn />,
        );

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        expect(
          await findByText('로그인에 실패했습니다. 다시 시도해주세요.'),
        ).toBeOnTheScreen();
      });
    });
  });
});
