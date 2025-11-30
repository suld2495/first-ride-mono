import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import SignUp from '../../app/sign-up';
import { render } from '../setup/test-utils';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;

// axios mock adapter
let mockAxios: MockAdapter;

describe('SignUp 페이지', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // 버튼 찾기 헬퍼 함수 (제목이 아닌 버튼만 선택)
  const getSubmitButton = (getAllByText: (text: string) => any[]) => {
    const buttons = getAllByText('회원가입');

    // 두 번째 요소가 버튼 (첫 번째는 제목)
    return buttons[1];
  };

  describe('유효성 검증 테스트', () => {
    it('모든 필드가 비어있을 때 회원가입 버튼을 누르면 모든 필드에서 에러가 표시된다', async () => {
      const { getAllByText, findByText } = render(<SignUp />);

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      expect(await findByText('아이디를 입력해주세요.')).toBeOnTheScreen();
      expect(await findByText('닉네임을 입력해주세요.')).toBeOnTheScreen();
      expect(await findByText('비밀번호를 입력해주세요.')).toBeOnTheScreen();
      expect(
        await findByText('비밀번호 확인을 입력해주세요.'),
      ).toBeOnTheScreen();
    });

    it('아이디만 입력하고 회원가입 버튼을 누르면 나머지 필드에서 에러가 표시된다', async () => {
      const { getByPlaceholderText, getAllByText, findByText, queryByText } =
        render(<SignUp />);

      const userIdInput = getByPlaceholderText('아이디를 입력해주세요.');

      fireEvent.changeText(userIdInput, 'testuser');

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByText('아이디를 입력해주세요.')).not.toBeOnTheScreen();
      });
      expect(await findByText('닉네임을 입력해주세요.')).toBeOnTheScreen();
      expect(await findByText('비밀번호를 입력해주세요.')).toBeOnTheScreen();
      expect(
        await findByText('비밀번호 확인을 입력해주세요.'),
      ).toBeOnTheScreen();
    });

    it('아이디, 닉네임만 입력하고 회원가입 버튼을 누르면 나머지 필드에서 에러가 표시된다', async () => {
      const { getByPlaceholderText, getAllByText, findByText, queryByText } =
        render(<SignUp />);

      const userIdInput = getByPlaceholderText('아이디를 입력해주세요.');

      fireEvent.changeText(userIdInput, 'testuser');

      const nicknameInput = getByPlaceholderText('닉네임을 입력해주세요.');

      fireEvent.changeText(nicknameInput, 'testnick');

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByText('아이디를 입력해주세요.')).not.toBeOnTheScreen();
        expect(queryByText('닉네임을 입력해주세요.')).not.toBeOnTheScreen();
      });
      expect(await findByText('비밀번호를 입력해주세요.')).toBeOnTheScreen();
      expect(
        await findByText('비밀번호 확인을 입력해주세요.'),
      ).toBeOnTheScreen();
    });

    it('비밀번호 확인만 입력하지 않으면 비밀번호 확인 에러만 표시된다', async () => {
      const { getByPlaceholderText, getAllByText, findByText, queryByText } =
        render(<SignUp />);

      const userIdInput = getByPlaceholderText('아이디를 입력해주세요.');

      fireEvent.changeText(userIdInput, 'testuser');

      const nicknameInput = getByPlaceholderText('닉네임을 입력해주세요.');

      fireEvent.changeText(nicknameInput, 'testnick');

      const passwordInput = getByPlaceholderText('비밀번호를 입력해주세요.');

      fireEvent.changeText(passwordInput, 'password123');

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByText('아이디를 입력해주세요.')).not.toBeOnTheScreen();
        expect(queryByText('닉네임을 입력해주세요.')).not.toBeOnTheScreen();
        expect(queryByText('비밀번호를 입력해주세요.')).not.toBeOnTheScreen();
      });
      expect(
        await findByText('비밀번호 확인을 입력해주세요.'),
      ).toBeOnTheScreen();
    });

    it('비밀번호와 비밀번호 확인이 일치하지 않으면 에러가 표시된다', async () => {
      const { getByPlaceholderText, getAllByText, findByText } = render(
        <SignUp />,
      );

      const userIdInput = getByPlaceholderText('아이디를 입력해주세요.');

      fireEvent.changeText(userIdInput, 'testuser');

      const nicknameInput = getByPlaceholderText('닉네임을 입력해주세요.');

      fireEvent.changeText(nicknameInput, 'testnick');

      const passwordInput = getByPlaceholderText('비밀번호를 입력해주세요.');

      fireEvent.changeText(passwordInput, 'password123');

      const confirmPasswordInput =
        getByPlaceholderText('비밀번호를 다시 입력해주세요.');

      fireEvent.changeText(confirmPasswordInput, 'differentpassword');

      const submitButton = getSubmitButton(getAllByText);

      fireEvent.press(submitButton);

      expect(
        await findByText('비밀번호가 일치하지 않습니다.'),
      ).toBeOnTheScreen();
    });

    it('에러 상태에서 필드를 수정하면 해당 에러가 사라진다', async () => {
      const { getByPlaceholderText, getAllByText, findByText, queryByText } =
        render(<SignUp />);

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
        nickname: string;
        password: string;
        confirmPassword: string;
      },
    ) => {
      fireEvent.changeText(
        getByPlaceholderText('아이디를 입력해주세요.'),
        data.userId,
      );

      fireEvent.changeText(
        getByPlaceholderText('닉네임을 입력해주세요.'),
        data.nickname,
      );

      fireEvent.changeText(
        getByPlaceholderText('비밀번호를 입력해주세요.'),
        data.password,
      );

      fireEvent.changeText(
        getByPlaceholderText('비밀번호를 다시 입력해주세요.'),
        data.confirmPassword,
      );
    };

    describe('회원가입 성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/signup').reply(200, { data: null });
      });

      it('로그인 페이지로 이동한다', async () => {
        const { getByPlaceholderText, getAllByText } = render(<SignUp />);

        fillForm(getByPlaceholderText, {
          userId: 'newuser',
          nickname: 'newnick',
          password: 'password123',
          confirmPassword: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/sign-in');
        });
      });
    });

    describe('아이디 중복 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/signup').reply(400, {
          error: {
            message: '아이디 중복',
            data: [{ field: 'userId', message: '이미 사용중인 아이디입니다.' }],
          },
        });
      });

      it('에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText, findByText } = render(
          <SignUp />,
        );

        fillForm(getByPlaceholderText, {
          userId: 'duplicate',
          nickname: 'testnick',
          password: 'password123',
          confirmPassword: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        expect(
          await findByText('이미 사용중인 아이디입니다.'),
        ).toBeOnTheScreen();
      });
    });

    describe('닉네임 중복 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/signup').reply(400, {
          error: {
            message: '닉네임 중복',
            data: [
              { field: 'nickname', message: '이미 사용중인 닉네임입니다.' },
            ],
          },
        });
      });

      it('에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText, findByText } = render(
          <SignUp />,
        );

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          nickname: 'duplicatenick',
          password: 'password123',
          confirmPassword: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        expect(
          await findByText('이미 사용중인 닉네임입니다.'),
        ).toBeOnTheScreen();
      });
    });

    describe('아이디 길이가 유효하지 않을 시', () => {
      describe('4자 미만일 때', () => {
        beforeEach(() => {
          mockAxios.onPost('/auth/signup').reply(400, {
            error: {
              message: '아이디 길이 오류',
              data: [
                {
                  field: 'userId',
                  message: '크기가 4에서 10 사이여야 합니다.',
                },
              ],
            },
          });
        });

        it('에러 메시지가 표시된다', async () => {
          const { getByPlaceholderText, getAllByText, findByText } = render(
            <SignUp />,
          );

          fillForm(getByPlaceholderText, {
            userId: 'abc',
            nickname: 'testnick',
            password: 'password123',
            confirmPassword: 'password123',
          });

          const submitButton = getSubmitButton(getAllByText);

          fireEvent.press(submitButton);

          expect(
            await findByText('크기가 4에서 10 사이여야 합니다.'),
          ).toBeOnTheScreen();
        });
      });

      describe('10자 초과일 때', () => {
        beforeEach(() => {
          mockAxios.onPost('/auth/signup').reply(400, {
            error: {
              message: '아이디 길이 오류',
              data: [
                {
                  field: 'userId',
                  message: '크기가 4에서 10 사이여야 합니다.',
                },
              ],
            },
          });
        });

        it('에러 메시지가 표시된다', async () => {
          const { getByPlaceholderText, getAllByText, findByText } = render(
            <SignUp />,
          );

          fillForm(getByPlaceholderText, {
            userId: 'verylonguser',
            nickname: 'testnick',
            password: 'password123',
            confirmPassword: 'password123',
          });

          const submitButton = getSubmitButton(getAllByText);

          fireEvent.press(submitButton);

          expect(
            await findByText('크기가 4에서 10 사이여야 합니다.'),
          ).toBeOnTheScreen();
        });
      });
    });

    describe('닉네임 길이가 유효하지 않을 시', () => {
      describe('2자 미만일 때', () => {
        beforeEach(() => {
          mockAxios.onPost('/auth/signup').reply(400, {
            error: {
              message: '닉네임 길이 오류',
              data: [
                {
                  field: 'nickname',
                  message: '크기가 2에서 10 사이여야 합니다.',
                },
              ],
            },
          });
        });

        it('에러 메시지가 표시된다', async () => {
          const { getByPlaceholderText, getAllByText, findByText } = render(
            <SignUp />,
          );

          fillForm(getByPlaceholderText, {
            userId: 'testuser',
            nickname: 'a',
            password: 'password123',
            confirmPassword: 'password123',
          });

          const submitButton = getSubmitButton(getAllByText);

          fireEvent.press(submitButton);

          expect(
            await findByText('크기가 2에서 10 사이여야 합니다.'),
          ).toBeOnTheScreen();
        });
      });

      describe('10자 초과일 때', () => {
        beforeEach(() => {
          mockAxios.onPost('/auth/signup').reply(400, {
            error: {
              message: '닉네임 길이 오류',
              data: [
                {
                  field: 'nickname',
                  message: '크기가 2에서 10 사이여야 합니다.',
                },
              ],
            },
          });
        });

        it('에러 메시지가 표시된다', async () => {
          const { getByPlaceholderText, getAllByText, findByText } = render(
            <SignUp />,
          );

          fillForm(getByPlaceholderText, {
            userId: 'testuser',
            nickname: 'verylongnickname',
            password: 'password123',
            confirmPassword: 'password123',
          });

          const submitButton = getSubmitButton(getAllByText);

          fireEvent.press(submitButton);

          expect(
            await findByText('크기가 2에서 10 사이여야 합니다.'),
          ).toBeOnTheScreen();
        });
      });
    });

    describe('비밀번호 길이가 유효하지 않을 시', () => {
      describe('8자 미만일 때', () => {
        beforeEach(() => {
          mockAxios.onPost('/auth/signup').reply(400, {
            error: {
              message: '비밀번호 길이 오류',
              data: [
                {
                  field: 'password',
                  message: '크기가 8에서 15 사이여야 합니다.',
                },
              ],
            },
          });
        });

        it('에러 메시지가 표시된다', async () => {
          const { getByPlaceholderText, getAllByText, findByText } = render(
            <SignUp />,
          );

          fillForm(getByPlaceholderText, {
            userId: 'testuser',
            nickname: 'testnick',
            password: 'short',
            confirmPassword: 'short',
          });

          const submitButton = getSubmitButton(getAllByText);

          fireEvent.press(submitButton);

          expect(
            await findByText('크기가 8에서 15 사이여야 합니다.'),
          ).toBeOnTheScreen();
        });
      });

      describe('15자 초과일 때', () => {
        beforeEach(() => {
          mockAxios.onPost('/auth/signup').reply(400, {
            error: {
              message: '비밀번호 길이 오류',
              data: [
                {
                  field: 'password',
                  message: '크기가 8에서 15 사이여야 합니다.',
                },
              ],
            },
          });
        });

        it('에러 메시지가 표시된다', async () => {
          const { getByPlaceholderText, getAllByText, findByText } = render(
            <SignUp />,
          );

          fillForm(getByPlaceholderText, {
            userId: 'testuser',
            nickname: 'testnick',
            password: 'verylongpassword123',
            confirmPassword: 'verylongpassword123',
          });

          const submitButton = getSubmitButton(getAllByText);

          fireEvent.press(submitButton);

          expect(
            await findByText('크기가 8에서 15 사이여야 합니다.'),
          ).toBeOnTheScreen();
        });
      });
    });

    describe('비밀번호와 비밀번호 확인 불일치 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/signup').reply(400, {
          error: {
            message: '비밀번호 불일치',
            data: [
              {
                field: 'passwordConfirm',
                message: '비밀번호가 일치하지 않습니다.',
              },
            ],
          },
        });
      });

      it('에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText, findByText } = render(
          <SignUp />,
        );

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          nickname: 'testnick',
          password: 'password123',
          confirmPassword: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        expect(
          await findByText('비밀번호가 일치하지 않습니다.'),
        ).toBeOnTheScreen();
      });
    });

    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/signup').reply(500, {
          error: {
            message: '서버 오류가 발생했습니다.',
          },
        });
      });

      it('일반 에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText, findByText } = render(
          <SignUp />,
        );

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          nickname: 'testnick',
          password: 'password123',
          confirmPassword: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        expect(await findByText('서버 오류가 발생했습니다.')).toBeOnTheScreen();
      });
    });
  });
});
