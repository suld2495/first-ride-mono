import axiosInstance from '@repo/shared/api';
import { act, fireEvent } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { ActivityIndicator } from 'react-native';

import SignUpEmailVerification from '../../app/sign-up-email-verification';
import { usePendingSignUpStore } from '../../store/pending-sign-up.store';
import { render } from '../setup/test-utils';

declare const mockPush: jest.Mock;
declare const mockReplace: jest.Mock;
declare const mockShowToast: jest.Mock;

let mockAxios: MockAdapter;

const pendingPayload = {
  userId: 'a@b.co',
  nickname: '윤윤',
  password: 'password1234',
  job: '마법사',
};

type VerificationResponse = [
  number,
  { data: { email: string; verified: boolean } },
];

const createDeferredVerificationResponse = () => {
  let resolveResponse: (response: VerificationResponse) => void = () =>
    undefined;
  const promise = new Promise<VerificationResponse>((resolve) => {
    resolveResponse = resolve;
  });

  return { promise, resolve: resolveResponse };
};

const flushAsyncWork = async () => {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(0);
  });
};

describe('SignUpEmailVerification 페이지', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockShowToast.mockClear();
    usePendingSignUpStore.getState().setPayload(pendingPayload);
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    act(() => {
      usePendingSignUpStore.getState().clearPayload();
    });
    mockAxios.restore();
  });

  it('인증 메일 안내와 로그인 버튼을 표시한다', () => {
    mockAxios.onPost('/auth/email/verification-confirm').reply(200, {
      data: { email: 'a@b.co', verified: false },
    });

    const { getByText, UNSAFE_queryByType } = render(
      <SignUpEmailVerification />,
    );

    expect(
      getByText('이메일로 보낸 인증 링크를 클릭해주세요'),
    ).toBeOnTheScreen();
    expect(getByText('a@b.co')).toBeOnTheScreen();
    expect(getByText('로그인하기')).toBeOnTheScreen();
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('인증 완료가 확인되면 회원가입 후 로그인 페이지로 이동한다', async () => {
    mockAxios
      .onPost('/auth/email/verification-confirm')
      .replyOnce(200, {
        data: { email: 'a@b.co', verified: false },
      })
      .onPost('/auth/email/verification-confirm')
      .replyOnce(200, {
        data: { email: 'a@b.co', verified: true },
      });
    mockAxios.onPost('/auth/signup').reply(200, { data: null });

    const { getByText } = render(<SignUpEmailVerification />);

    expect(getByText('이메일 인증을 확인하고 있어요')).toBeOnTheScreen();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2500);
    });

    expect(mockAxios.history.post[1]?.url).toBe(
      '/auth/email/verification-confirm',
    );
    expect(mockAxios.history.post[2]?.url).toBe('/auth/signup');
    expect(mockAxios.history.post[2]?.data).toContain('"userId":"a@b.co"');
    expect(usePendingSignUpStore.getState().payload).toBeNull();
    expect(mockShowToast).toHaveBeenCalledWith(
      '회원가입이 완료되었습니다.',
      'success',
    );
    expect(mockReplace).toHaveBeenCalledWith('/sign-in');
  });

  it('최대 대기 시간이 지나면 폴링을 중단하고 만료 상태를 표시한다', async () => {
    mockAxios.onPost('/auth/email/verification-confirm').reply(200, {
      data: { email: 'a@b.co', verified: false },
    });

    const { getByText } = render(<SignUpEmailVerification />);

    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000);
    });

    expect(getByText('이메일 인증 시간이 만료되었습니다.')).toBeOnTheScreen();
  });

  it('로그인하기를 누르면 대기 정보를 지우고 로그인 페이지로 이동한다', () => {
    mockAxios.onPost('/auth/email/verification-confirm').reply(200, {
      data: { email: 'a@b.co', verified: false },
    });

    const { getByText } = render(<SignUpEmailVerification />);

    fireEvent.press(getByText('로그인하기'));

    expect(usePendingSignUpStore.getState().payload).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/sign-in');
  });

  it('느린 인증 확인 응답을 기다리는 동안 다음 요청을 시작하지 않는다', async () => {
    const firstResponse = createDeferredVerificationResponse();

    mockAxios
      .onPost('/auth/email/verification-confirm')
      .reply(() => firstResponse.promise);

    render(<SignUpEmailVerification />);
    await flushAsyncWork();

    expect(mockAxios.history.post).toHaveLength(1);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(10_000);
    });

    expect(mockAxios.history.post).toHaveLength(1);

    firstResponse.resolve([
      200,
      { data: { email: 'a@b.co', verified: false } },
    ]);
    await flushAsyncWork();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2499);
    });
    expect(mockAxios.history.post).toHaveLength(1);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(mockAxios.history.post).toHaveLength(2);
  });

  it('연속 오류에는 지수 backoff를 적용하고 정상 응답에서 대기 상태를 복구한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    mockAxios
      .onPost('/auth/email/verification-confirm')
      .replyOnce(500, { error: { message: 'temporary failure' } })
      .onPost('/auth/email/verification-confirm')
      .replyOnce(500, { error: { message: 'temporary failure' } })
      .onPost('/auth/email/verification-confirm')
      .replyOnce(200, {
        data: { email: 'a@b.co', verified: false },
      });

    const { getByText } = render(<SignUpEmailVerification />);
    await flushAsyncWork();

    expect(mockAxios.history.post).toHaveLength(1);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(4999);
    });
    expect(mockAxios.history.post).toHaveLength(1);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(mockAxios.history.post).toHaveLength(2);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(9999);
    });
    expect(mockAxios.history.post).toHaveLength(2);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(mockAxios.history.post).toHaveLength(3);
    expect(
      getByText('이메일로 보낸 인증 링크를 클릭해주세요'),
    ).toBeOnTheScreen();
    expect(getByText('이메일 인증을 확인하고 있어요')).toBeOnTheScreen();
  });

  it('429 응답의 Retry-After 동안 추가 요청을 보내지 않는다', async () => {
    mockAxios
      .onPost('/auth/email/verification-confirm')
      .replyOnce(
        429,
        { error: { message: 'too many requests' } },
        { 'Retry-After': '12' },
      )
      .onPost('/auth/email/verification-confirm')
      .replyOnce(200, {
        data: { email: 'a@b.co', verified: false },
      });

    render(<SignUpEmailVerification />);
    await flushAsyncWork();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(11_999);
    });
    expect(mockAxios.history.post).toHaveLength(1);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(mockAxios.history.post).toHaveLength(2);
  });

  it('화면을 벗어나면 진행 중인 인증 확인 요청을 취소한다', async () => {
    const response = createDeferredVerificationResponse();

    mockAxios
      .onPost('/auth/email/verification-confirm')
      .reply(() => response.promise);

    const screen = render(<SignUpEmailVerification />);
    await flushAsyncWork();

    const signal = mockAxios.history.post[0]?.signal;

    expect(signal).toBeDefined();
    expect(signal?.aborted).toBe(false);

    screen.unmount();

    expect(signal?.aborted).toBe(true);
    response.resolve([200, { data: { email: 'a@b.co', verified: false } }]);
  });
});
