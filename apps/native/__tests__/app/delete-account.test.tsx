import { useDeleteAccountMutation } from '@repo/shared/hooks/useAuth';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import DeleteAccountPage from '@/app/delete-account';
import { useToast } from '@/contexts/ToastContext';
import { useAuthSignOutLocally, useAuthUser } from '@/hooks/useAuthSession';

import { render } from '../setup/test-utils';

jest.mock('@repo/shared/hooks/useAuth', () => ({
  useDeleteAccountMutation: jest.fn(),
}));

jest.mock('@repo/shared/hooks/useUser', () => ({
  useFetchMeQuery: jest.fn(),
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/hooks/useAuthSession', () => ({
  useAuthSignOutLocally: jest.fn(),
  useAuthUser: jest.fn(),
}));

describe('회원 탈퇴 화면', () => {
  const mutateAsync = jest.fn();
  const signOutLocally = jest.fn();
  const showToast = jest.fn();
  let confirmDeletion: (() => void | Promise<void>) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    confirmDeletion = undefined;
    (useAuthUser as jest.Mock).mockReturnValue({
      userId: 'plain-user',
      nickname: '사용자',
    });
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: { loginType: 'PLAIN' },
    });
    (useDeleteAccountMutation as jest.Mock).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
    (useAuthSignOutLocally as jest.Mock).mockReturnValue(signOutLocally);
    (useToast as jest.Mock).mockReturnValue({ showToast });
    mutateAsync.mockResolvedValue({ message: '회원탈퇴가 완료되었습니다.' });
    signOutLocally.mockResolvedValue(undefined);
    jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        confirmDeletion = buttons?.find(
          (button) => button.text === '회원 탈퇴',
        )?.onPress;
      });
  });

  it('일반 로그인 계정은 비밀번호를 입력한 뒤 탈퇴한다', async () => {
    const { getByLabelText } = render(<DeleteAccountPage />);
    const submitButton = getByLabelText('회원 탈퇴 진행');

    expect(getByLabelText('현재 비밀번호')).toBeOnTheScreen();
    expect(submitButton).toBeDisabled();

    fireEvent.changeText(getByLabelText('현재 비밀번호'), 'current-password');
    fireEvent.press(submitButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      '회원 탈퇴',
      expect.stringContaining('복구할 수 없습니다'),
      expect.any(Array),
    );

    await confirmDeletion?.();

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        password: 'current-password',
      });
      expect(showToast).toHaveBeenCalledWith(
        '회원탈퇴가 완료되었습니다.',
        'success',
      );
      expect(signOutLocally).toHaveBeenCalledTimes(1);
    });
  });

  it('소셜 로그인 계정은 비밀번호 입력 없이 탈퇴한다', async () => {
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: { loginType: 'KAKAO' },
    });

    const { getByLabelText, queryByLabelText } = render(<DeleteAccountPage />);

    expect(queryByLabelText('현재 비밀번호')).toBeNull();

    fireEvent.press(getByLabelText('회원 탈퇴 진행'));
    await confirmDeletion?.();

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(undefined);
      expect(signOutLocally).toHaveBeenCalledTimes(1);
    });
  });

  it('사용자 상세 조회 전에는 로그인 응답의 로그인 유형을 사용한다', () => {
    (useAuthUser as jest.Mock).mockReturnValue({
      userId: 'plain-user',
      nickname: '사용자',
      loginType: 'PLAIN',
    });
    (useFetchMeQuery as jest.Mock).mockReturnValue({ data: undefined });

    const { getByLabelText } = render(<DeleteAccountPage />);

    expect(getByLabelText('현재 비밀번호')).toBeOnTheScreen();
  });

  it('로그인 유형을 아직 확인하지 못했으면 탈퇴를 비활성화한다', () => {
    (useFetchMeQuery as jest.Mock).mockReturnValue({ data: undefined });

    const { getByLabelText, queryByLabelText, queryByText } = render(
      <DeleteAccountPage />,
    );

    expect(queryByLabelText('현재 비밀번호')).toBeNull();
    expect(
      queryByText('소셜 로그인 계정은 비밀번호 확인 없이 탈퇴할 수 있습니다.'),
    ).toBeNull();
    expect(getByLabelText('회원 탈퇴 진행')).toBeDisabled();
  });

  it('탈퇴 실패 시 서버 오류를 표시하고 세션을 유지한다', async () => {
    mutateAsync.mockRejectedValue(new Error('비밀번호가 일치하지 않습니다.'));

    const { getByLabelText } = render(<DeleteAccountPage />);

    fireEvent.changeText(getByLabelText('현재 비밀번호'), 'wrong-password');
    fireEvent.press(getByLabelText('회원 탈퇴 진행'));
    await confirmDeletion?.();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        '비밀번호가 일치하지 않습니다.',
        'error',
      );
      expect(signOutLocally).not.toHaveBeenCalled();
    });
  });

  it('서버 탈퇴 성공 뒤 로컬 정리가 실패해도 탈퇴 실패로 표시하지 않는다', async () => {
    signOutLocally.mockRejectedValue(new Error('local cleanup failed'));

    const { getByLabelText } = render(<DeleteAccountPage />);

    fireEvent.changeText(getByLabelText('현재 비밀번호'), 'current-password');
    fireEvent.press(getByLabelText('회원 탈퇴 진행'));
    await confirmDeletion?.();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        '회원탈퇴가 완료되었습니다.',
        'success',
      );
      expect(showToast).toHaveBeenCalledWith(
        '회원탈퇴는 완료되었습니다. 앱을 다시 시작해주세요.',
        'warning',
      );
      expect(showToast).not.toHaveBeenCalledWith(
        'local cleanup failed',
        'error',
      );
    });
  });

  it('형식을 알 수 없는 탈퇴 오류에는 기본 메시지를 표시한다', async () => {
    mutateAsync.mockRejectedValue(null);

    const { getByLabelText } = render(<DeleteAccountPage />);

    fireEvent.changeText(getByLabelText('현재 비밀번호'), 'current-password');
    fireEvent.press(getByLabelText('회원 탈퇴 진행'));
    await confirmDeletion?.();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        '회원 탈퇴에 실패했습니다.',
        'error',
      );
      expect(signOutLocally).not.toHaveBeenCalled();
    });
  });
});
