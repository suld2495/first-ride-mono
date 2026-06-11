import axiosInstance from '@repo/shared/api';
import { act, fireEvent } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import SignUpEmailVerification from '../../app/sign-up-email-verification';
import { usePendingSignUpStore } from '../../store/pending-sign-up.store';
import { render } from '../setup/test-utils';

declare const mockPush: jest.Mock;
declare const mockReplace: jest.Mock;

let mockAxios: MockAdapter;

const pendingPayload = {
  userId: 'a@b.co',
  nickname: '윤윤',
  password: 'password1234',
  job: '마법사',
};

describe('SignUpEmailVerification 페이지', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPush.mockClear();
    mockReplace.mockClear();
    usePendingSignUpStore.getState().setPayload(pendingPayload);
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
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

    const { getByText } = render(<SignUpEmailVerification />);

    expect(
      getByText('이메일로 보낸 인증 링크를 클릭해주세요'),
    ).toBeOnTheScreen();
    expect(getByText('a@b.co')).toBeOnTheScreen();
    expect(getByText('로그인하기')).toBeOnTheScreen();
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
});
