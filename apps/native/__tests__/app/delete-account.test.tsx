import { useDeleteAccountMutation } from '@repo/shared/hooks/useAuth';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { deletePushToken } from '@/api/push-token.api';
import DeleteAccountPage from '@/app/delete-account';
import { useToast } from '@/contexts/ToastContext';
import { useAuthSignOutLocally, useAuthUser } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';

import { render } from '../setup/test-utils';

jest.mock('@repo/shared/hooks/useAuth', () => ({
  useDeleteAccountMutation: jest.fn(),
}));

jest.mock('@repo/shared/hooks/useUser', () => ({
  useFetchMeQuery: jest.fn(),
}));

jest.mock('@/api/push-token.api', () => ({
  deletePushToken: jest.fn(),
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/hooks/useAuthSession', () => ({
  useAuthSignOutLocally: jest.fn(),
  useAuthUser: jest.fn(),
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
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
    (useNotifications as jest.Mock).mockReturnValue({
      pushToken: { data: 'expo-push-token' },
    });
    (useToast as jest.Mock).mockReturnValue({ showToast });
    mutateAsync.mockResolvedValue({ message: '회원탈퇴가 완료되었습니다.' });
    signOutLocally.mockResolvedValue(undefined);
    (deletePushToken as jest.Mock).mockResolvedValue(undefined);
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
      expect(deletePushToken).toHaveBeenCalledWith('expo-push-token');
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
});
