import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { StyleSheet as RNStyleSheet } from 'react-native';

import SignUp from '../../app/sign-up';
import PageHeader from '../../components/layout/page-header';
import { useColorSchemeStore } from '../../store/color-scheme.store';
import { usePendingSignUpStore } from '../../store/pending-sign-up.store';
import { palette } from '../../theme/tokens';
import { render } from '../setup/test-utils';

declare const mockPush: jest.Mock;
declare const mockReplace: jest.Mock;

let mockAxios: MockAdapter;

const jobOptions = [
  {
    jobName: '마법사',
    jobType: 'MAGE',
    characterCode: 'MAGE_BEGINNER',
    imageUrl: 'https://api.irura.uk/assets/characters/mage_beginner.png',
  },
  {
    jobName: '검사',
    jobType: 'WARRIOR',
    characterCode: 'WARRIOR_BEGINNER',
    imageUrl: 'https://api.irura.uk/assets/characters/warrior_beginner.png',
  },
  {
    jobName: '궁수',
    jobType: 'ARCHER',
    characterCode: 'ARCHER_BEGINNER',
    imageUrl: 'https://api.irura.uk/assets/characters/archer_beginner.png',
  },
];

const fillBasicFields = (getByPlaceholderText: (text: string) => any) => {
  fireEvent.changeText(getByPlaceholderText('이메일을 입력하세요'), 'a@b.co');
  fireEvent.changeText(getByPlaceholderText('닉네임을 입력하세요'), '윤윤');
  fireEvent.changeText(
    getByPlaceholderText('비밀번호를 입력하세요'),
    'password1234',
  );
  fireEvent.changeText(
    getByPlaceholderText('비밀번호를 한 번 더 입력하세요'),
    'password1234',
  );
};

const goToJobStep = async (
  getByPlaceholderText: (text: string) => any,
  getByText: (text: string) => any,
  findByText: (text: string) => Promise<any>,
) => {
  fillBasicFields(getByPlaceholderText);
  fireEvent.press(getByText('다음'));

  await findByText('캐릭터 선택');
  await findByText('전사');
};

const getButtonStyle = (button: any) =>
  RNStyleSheet.flatten(
    typeof button.props.style === 'function'
      ? button.props.style({ pressed: false })
      : button.props.style,
  );

const mockAvailableNickname = (nickname = '윤윤') => {
  mockAxios.onGet('/auth/nickname/check').reply(200, {
    data: { nickname, available: true },
  });
};

describe('SignUp 페이지', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    usePendingSignUpStore.getState().clearPayload();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(200, {
      data: { email: 'a@b.co', available: true },
    });
    mockAvailableNickname();
    mockAxios.onPost('/auth/email/verification-requests').reply(200, {
      data: { message: '이메일 인증 메일을 발송했습니다.' },
    });
  });

  afterEach(() => {
    useColorSchemeStore.getState().clearColorSchemeOverride();
    mockAxios.restore();
  });

  it('공통 페이지 헤더와 분리된 바디 구조로 회원가입 단계를 표시한다', async () => {
    const screen = render(<SignUp />);

    expect(screen.UNSAFE_getByType(PageHeader).props).toEqual(
      expect.objectContaining({
        title: '회원가입',
        showBackButton: true,
      }),
    );
    expect(screen.getByTestId('sign-up-page-body')).toBeOnTheScreen();

    fillBasicFields(screen.getByPlaceholderText);
    fireEvent.press(screen.getByText('다음'));

    await screen.findByText('캐릭터 선택');

    expect(screen.UNSAFE_getByType(PageHeader).props).toEqual(
      expect.objectContaining({
        title: '캐릭터 선택',
        showBackButton: true,
      }),
    );
    expect(screen.getByTestId('sign-up-page-body')).toBeOnTheScreen();
  });

  it('캐릭터 선택 바디의 좌우 여백을 12로 표시한다', async () => {
    const screen = render(<SignUp />);

    await goToJobStep(
      screen.getByPlaceholderText,
      screen.getByText,
      screen.findByText,
    );

    expect(
      RNStyleSheet.flatten(screen.getByTestId('sign-up-page-body').props.style),
    ).toEqual(
      expect.objectContaining({
        paddingHorizontal: 12,
      }),
    );
  });

  it('저장된 테마와 관계없이 기존 회원가입 배경을 유지한다', async () => {
    useColorSchemeStore.getState().setColorSchemeOverride('light');

    const screen = render(<SignUp />);

    expect(
      RNStyleSheet.flatten(screen.getByTestId('sign-up-page').props.style),
    ).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.blue[10],
      }),
    );

    await waitFor(() => {
      expect(
        mockAxios.history.get.some((req) => req.url === '/auth/job-options'),
      ).toBe(true);
    });
  });

  it('기본 입력값이 비어 있으면 다음 버튼이 비활성화된다', async () => {
    const { getByTestId, queryByText } = render(<SignUp />);

    const submitButton = getByTestId('sign-up-submit-button');

    fireEvent.press(submitButton);

    expect(submitButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
    expect(getButtonStyle(submitButton)).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.gray[10],
        opacity: 1,
      }),
    );
    expect(queryByText('아이디를 입력해주세요.')).not.toBeOnTheScreen();
    expect(queryByText('닉네임을 입력해주세요.')).not.toBeOnTheScreen();
    expect(queryByText('비밀번호를 입력해주세요.')).not.toBeOnTheScreen();
    expect(queryByText('비밀번호 확인을 입력해주세요.')).not.toBeOnTheScreen();
    expect(queryByText('캐릭터 선택')).not.toBeOnTheScreen();

    await waitFor(() => {
      expect(
        mockAxios.history.get.some((req) => req.url === '/auth/job-options'),
      ).toBe(true);
    });
  });

  it('기본 입력값이 모두 입력되면 다음 버튼이 활성화된다', async () => {
    const { getByPlaceholderText, getByTestId } = render(<SignUp />);

    fillBasicFields(getByPlaceholderText);

    const submitButton = getByTestId('sign-up-submit-button');

    expect(submitButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
    expect(getButtonStyle(submitButton)).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.gray[90],
      }),
    );

    await waitFor(() => {
      expect(
        mockAxios.history.get.some((req) => req.url === '/auth/job-options'),
      ).toBe(true);
    });
  });

  it('기본 성별 FEMALE로 직업 선택지를 조회한다', async () => {
    render(<SignUp />);

    await waitFor(() => {
      expect(
        mockAxios.history.get.some(
          (req) =>
            req.url === '/auth/job-options' && req.params?.gender === 'FEMALE',
        ),
      ).toBe(true);
    });
  });

  it('비밀번호와 비밀번호 확인이 일치하지 않으면 에러를 표시한다', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText('이메일을 입력하세요'), 'a@b.co');
    fireEvent.changeText(
      getByPlaceholderText('닉네임을 입력하세요'),
      'newnick',
    );
    fireEvent.changeText(
      getByPlaceholderText('비밀번호를 입력하세요'),
      'password123',
    );
    fireEvent.changeText(
      getByPlaceholderText('비밀번호를 한 번 더 입력하세요'),
      'differentpassword',
    );
    fireEvent.press(getByText('다음'));

    expect(await findByText('비밀번호가 일치하지 않습니다.')).toBeOnTheScreen();
  });

  it('아이디 이메일 형식을 검증한다', async () => {
    const { getByPlaceholderText, getByText, findByText, queryByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.changeText(getByPlaceholderText('이메일을 입력하세요'), 'abc');
    fireEvent.press(getByText('다음'));

    expect(
      await findByText('아이디는 이메일 형식이어야 합니다.'),
    ).toBeOnTheScreen();
    expect(queryByText('캐릭터 선택')).not.toBeOnTheScreen();
  });

  it('아이디가 100자를 넘으면 다음 단계로 이동하지 않는다', async () => {
    const { getByPlaceholderText, getByText, findByText, queryByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.changeText(
      getByPlaceholderText('이메일을 입력하세요'),
      `${'a'.repeat(96)}@b.co`,
    );
    fireEvent.press(getByText('다음'));

    expect(
      await findByText('아이디는 100자 이하로 입력해주세요.'),
    ).toBeOnTheScreen();
    expect(queryByText('캐릭터 선택')).not.toBeOnTheScreen();
  });

  it('닉네임 길이를 검증한다', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<SignUp />);

    fillBasicFields(getByPlaceholderText);
    fireEvent.changeText(getByPlaceholderText('닉네임을 입력하세요'), 'a');
    fireEvent.press(getByText('다음'));

    expect(
      await findByText('닉네임은 2~10자로 입력해주세요.'),
    ).toBeOnTheScreen();
  });

  it('비밀번호 길이를 검증한다', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<SignUp />);

    fillBasicFields(getByPlaceholderText);
    fireEvent.changeText(
      getByPlaceholderText('비밀번호를 입력하세요'),
      'short1',
    );
    fireEvent.changeText(
      getByPlaceholderText('비밀번호를 한 번 더 입력하세요'),
      'short1',
    );
    fireEvent.press(getByText('다음'));

    expect(
      await findByText('비밀번호는 8~15자로 입력해주세요.'),
    ).toBeOnTheScreen();
  });

  it('비밀번호 필드에 네이티브 공백 입력 차단을 적용한다', () => {
    const screen = render(<SignUp />);

    expect(
      screen.getByPlaceholderText('비밀번호를 입력하세요').props
        .disallowWhitespace,
    ).toBe(true);
    expect(
      screen.getByPlaceholderText('비밀번호를 한 번 더 입력하세요').props
        .disallowWhitespace,
    ).toBe(true);
  });

  it('비밀번호 공백을 JS 상태 업데이트 후에 제거하지 않는다', () => {
    const screen = render(<SignUp />);
    const passwordInput = screen.getByPlaceholderText(
      '비밀번호를 입력하세요',
    );

    // fireEvent.changeText는 네이티브 InputFilter를 거치지 않고 JS 콜백을 직접 호출한다.
    fireEvent.changeText(passwordInput, 'pass word');

    expect(passwordInput.props.value).toBe('pass word');
  });

  it('에러 상태에서 필드를 수정하면 해당 에러가 사라진다', async () => {
    const { getByPlaceholderText, getByText, findByText, queryByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.changeText(getByPlaceholderText('이메일을 입력하세요'), 'abc');
    fireEvent.press(getByText('다음'));

    expect(
      await findByText('아이디는 이메일 형식이어야 합니다.'),
    ).toBeOnTheScreen();

    fireEvent.changeText(getByPlaceholderText('이메일을 입력하세요'), 'a@b.co');

    await waitFor(() => {
      expect(
        queryByText('아이디는 이메일 형식이어야 합니다.'),
      ).not.toBeOnTheScreen();
    });
  });

  it('기본 입력값을 채우고 다음을 누르면 캐릭터 선택 화면을 표시한다', async () => {
    const { getByLabelText, getByPlaceholderText, getByText, findByText } =
      render(<SignUp />);

    await goToJobStep(getByPlaceholderText, getByText, findByText);

    expect(
      mockAxios.history.get.some((req) => req.url === '/auth/email/check'),
    ).toBe(true);
    expect(
      mockAxios.history.get.some(
        (req) =>
          req.url === '/auth/nickname/check' && req.params?.nickname === '윤윤',
      ),
    ).toBe(true);
    expect(await findByText('전사')).toBeOnTheScreen();
    fireEvent.press(getByLabelText('마법사 선택'));
    expect(await findByText('마법사')).toBeOnTheScreen();
    fireEvent.press(getByLabelText('궁수 선택'));
    expect(await findByText('궁수')).toBeOnTheScreen();
  });

  it('다음 클릭 후 아이디가 중복이면 기본 입력 화면에 에러를 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(200, {
      data: { email: 'a@b.co', available: false },
    });
    mockAvailableNickname();

    const { getByPlaceholderText, getByText, findByText, queryByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.press(getByText('다음'));

    expect(await findByText('이미 사용 중인 아이디입니다.')).toBeOnTheScreen();
    expect(queryByText('캐릭터 선택')).not.toBeOnTheScreen();
  });

  it('이메일 중복 확인의 서버 검증 메시지를 이메일 입력란에 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(400, {
      error: {
        message: '잘못 입력된 값입니다.',
        data: [
          {
            field: 'email',
            rejected: 'a@b.co',
            message: '이메일을 확인해주세요.',
          },
        ],
      },
    });
    mockAvailableNickname();

    const { getByPlaceholderText, getByText, findByText, queryByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.press(getByText('다음'));

    expect(await findByText('이메일을 확인해주세요.')).toBeOnTheScreen();
    expect(queryByText('캐릭터 선택')).not.toBeOnTheScreen();
  });

  it('다음 클릭 후 닉네임이 중복이면 기본 입력 화면에 에러를 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(200, {
      data: { email: 'a@b.co', available: true },
    });
    mockAxios.onGet('/auth/nickname/check').reply(200, {
      data: { nickname: '윤윤', available: false },
    });

    const { getByPlaceholderText, getByText, findByText, queryByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.press(getByText('다음'));

    expect(await findByText('이미 사용 중인 닉네임입니다.')).toBeOnTheScreen();
    expect(queryByText('캐릭터 선택')).not.toBeOnTheScreen();
  });

  it('닉네임 중복 확인의 서버 검증 메시지를 닉네임 입력란에 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(200, {
      data: { email: 'a@b.co', available: true },
    });
    mockAxios.onGet('/auth/nickname/check').reply(400, {
      success: false,
      error: {
        message: '잘못 입력된 값입니다.',
        data: [
          {
            field: 'nickname',
            rejected: '윤윤',
            message: '닉네임을 확인해주세요.',
          },
        ],
      },
    });

    const { getByPlaceholderText, getByText, findByText, queryByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.press(getByText('다음'));

    expect(await findByText('닉네임을 확인해주세요.')).toBeOnTheScreen();
    expect(queryByText('캐릭터 선택')).not.toBeOnTheScreen();
  });

  it('닉네임 중복 확인의 일반 서버 오류를 닉네임 입력란에 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(200, {
      data: { email: 'a@b.co', available: true },
    });
    mockAxios.onGet('/auth/nickname/check').reply(500, {
      error: {
        message: '닉네임 확인 서버 오류',
      },
    });

    const { getByPlaceholderText, getByText, findByText, queryByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.press(getByText('다음'));

    expect(await findByText('닉네임 확인 서버 오류')).toBeOnTheScreen();
    expect(queryByText('캐릭터 선택')).not.toBeOnTheScreen();
  });

  it('아이디 중복 체크 중에는 다음 버튼 텍스트 대신 로딩 상태를 표시한다', async () => {
    let resolveEmailCheck: (value: [number, unknown]) => void = () => {};

    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAvailableNickname();
    mockAxios.onGet('/auth/email/check').reply(
      () =>
        new Promise((resolve) => {
          resolveEmailCheck = resolve;
        }),
    );

    const { getByPlaceholderText, getByText, queryByText, findByText } = render(
      <SignUp />,
    );

    fillBasicFields(getByPlaceholderText);
    fireEvent.press(getByText('다음'));

    await waitFor(() => {
      expect(queryByText('다음')).not.toBeOnTheScreen();
    });

    resolveEmailCheck([
      200,
      {
        data: { email: 'a@b.co', available: true },
      },
    ]);

    expect(await findByText('캐릭터 선택')).toBeOnTheScreen();
  });

  it('선택한 직업의 jobName을 인증 대기 payload의 job 필드로 저장한다', async () => {
    const { getByPlaceholderText, getByText, getByLabelText, findByText } =
      render(<SignUp />);

    await goToJobStep(getByPlaceholderText, getByText, findByText);
    fireEvent.press(getByLabelText('전사 선택'));
    fireEvent.press(getByText('선택 완료'));

    await waitFor(() => {
      expect(usePendingSignUpStore.getState().payload?.job).toBe('검사');
    });
  });

  it('선택한 성별로 직업 선택지를 다시 조회하고 인증 대기 payload에 저장한다', async () => {
    const { getByPlaceholderText, getByText, getByLabelText, findByText } =
      render(<SignUp />);

    await goToJobStep(getByPlaceholderText, getByText, findByText);
    fireEvent.press(getByLabelText('남자 캐릭터 선택'));

    await waitFor(() => {
      expect(
        mockAxios.history.get.some(
          (req) =>
            req.url === '/auth/job-options' && req.params?.gender === 'MALE',
        ),
      ).toBe(true);
    });

    fireEvent.press(getByText('선택 완료'));

    await waitFor(() => {
      expect(usePendingSignUpStore.getState().payload?.gender).toBe('MALE');
    });
  });

  it('성별을 변경해도 현재 선택한 직업을 유지한다', async () => {
    const { getByPlaceholderText, getByText, getByLabelText, findByText } =
      render(<SignUp />);

    await goToJobStep(getByPlaceholderText, getByText, findByText);
    fireEvent.press(getByLabelText('궁수 선택'));
    fireEvent.press(getByLabelText('남자 캐릭터 선택'));

    await waitFor(() => {
      expect(
        mockAxios.history.get.some(
          (req) =>
            req.url === '/auth/job-options' && req.params?.gender === 'MALE',
        ),
      ).toBe(true);
    });

    expect(getByLabelText('궁수 선택').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );

    fireEvent.press(getByText('선택 완료'));

    await waitFor(() => {
      expect(usePendingSignUpStore.getState().payload).toEqual(
        expect.objectContaining({
          job: '궁수',
          gender: 'MALE',
        }),
      );
    });
  });

  it('현재 선택된 성별을 다시 눌러도 선택한 직업을 유지한다', async () => {
    const { getByPlaceholderText, getByText, getByLabelText, findByText } =
      render(<SignUp />);

    await goToJobStep(getByPlaceholderText, getByText, findByText);
    fireEvent.press(getByLabelText('마법사 선택'));
    fireEvent.press(getByLabelText('여자 캐릭터 선택'));
    fireEvent.press(getByText('선택 완료'));

    await waitFor(() => {
      expect(usePendingSignUpStore.getState().payload).toEqual(
        expect.objectContaining({
          job: '마법사',
          gender: 'FEMALE',
        }),
      );
    });
  });

  it('가입 버튼을 누르면 인증 메일 요청 후 이메일 인증 대기 화면으로 이동한다', async () => {
    const { getByPlaceholderText, getByText, getByLabelText, findByText } =
      render(<SignUp />);

    fillBasicFields(getByPlaceholderText);
    fireEvent.changeText(
      getByPlaceholderText('이메일을 입력하세요'),
      '  a@b.co  ',
    );
    fireEvent.changeText(
      getByPlaceholderText('닉네임을 입력하세요'),
      '  새닉네임  ',
    );
    fireEvent.press(getByText('다음'));

    await findByText('캐릭터 선택');
    expect(
      mockAxios.history.get.some(
        (req) =>
          req.url === '/auth/nickname/check' &&
          req.params?.nickname === '새닉네임',
      ),
    ).toBe(true);
    fireEvent.press(getByLabelText('마법사 선택'));
    fireEvent.press(getByText('선택 완료'));

    await waitFor(() => {
      expect(mockAxios.history.post[0]?.url).toBe(
        '/auth/email/verification-requests',
      );
      expect(mockAxios.history.post[0]?.data).toContain('"email":"a@b.co"');
      expect(mockAxios.history.post).toHaveLength(1);
      expect(usePendingSignUpStore.getState().payload).toEqual({
        userId: 'a@b.co',
        nickname: '새닉네임',
        password: 'password1234',
        job: '마법사',
        gender: 'FEMALE',
      });
      expect(mockPush).toHaveBeenCalledWith('/sign-up-email-verification');
    });
  });

  it('인증 메일 요청 중에는 가입 버튼에 로딩 상태를 표시한다', async () => {
    let resolveVerificationRequest: (
      value: [number, unknown],
    ) => void = () => {};

    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(200, {
      data: { email: 'a@b.co', available: true },
    });
    mockAvailableNickname();
    mockAxios.onPost('/auth/email/verification-requests').reply(
      () =>
        new Promise((resolve) => {
          resolveVerificationRequest = resolve;
        }),
    );

    const { getByPlaceholderText, getByText, getByLabelText, findByText } =
      render(<SignUp />);

    await goToJobStep(getByPlaceholderText, getByText, findByText);
    fireEvent.press(getByLabelText('마법사 선택'));
    fireEvent.press(getByText('선택 완료'));

    await waitFor(() => {
      expect(() => getByText('선택 완료')).toThrow();
    });

    resolveVerificationRequest([
      200,
      { data: { message: '이메일 인증 메일을 발송했습니다.' } },
    ]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-up-email-verification');
    });
  });

  it('인증 메일 요청 필드 에러는 기본 입력 화면에서 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(200, {
      data: { email: 'a@b.co', available: true },
    });
    mockAvailableNickname();
    mockAxios.onPost('/auth/email/verification-requests').reply(400, {
      error: {
        message: '잘못 입력된 값입니다.',
        data: [{ field: 'email', message: '이미 사용 중인 이메일입니다.' }],
      },
    });

    const { getByPlaceholderText, getByText, getByLabelText, findByText } =
      render(<SignUp />);

    await goToJobStep(getByPlaceholderText, getByText, findByText);
    fireEvent.press(getByLabelText('마법사 선택'));
    fireEvent.press(getByText('선택 완료'));

    expect(await findByText('이미 사용 중인 이메일입니다.')).toBeOnTheScreen();
    expect(await findByText('회원가입')).toBeOnTheScreen();
  });

  it('인증 메일 요청 일반 서버 에러는 비밀번호 필드 아래에 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/auth/job-options').reply(200, { data: jobOptions });
    mockAxios.onGet('/auth/email/check').reply(200, {
      data: { email: 'a@b.co', available: true },
    });
    mockAvailableNickname();
    mockAxios.onPost('/auth/email/verification-requests').reply(500, {
      error: {
        message: '서버 오류가 발생했습니다.',
      },
    });

    const { getByPlaceholderText, getByText, getByLabelText, findByText } =
      render(<SignUp />);

    await goToJobStep(getByPlaceholderText, getByText, findByText);
    fireEvent.press(getByLabelText('궁수 선택'));
    fireEvent.press(getByText('선택 완료'));

    expect(await findByText('서버 오류가 발생했습니다.')).toBeOnTheScreen();
  });
});
