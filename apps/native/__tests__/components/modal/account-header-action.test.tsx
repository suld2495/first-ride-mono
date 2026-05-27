import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import Account from '@/app/account';
import ModalHeader from '@/components/modal/modal-header';
import ModalHeaderActionProvider from '@/components/modal/modal-header-action-provider';
import { baseFoundation, palette } from '@/theme/tokens';

import { render } from '../../setup/test-utils';

jest.mock('@repo/shared/hooks/useUser', () => ({
  useFetchMeQuery: jest.fn(),
  useUpdateMottoMutation: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    canGoBack: () => true,
    replace: jest.fn(),
  },
  useRouter: () => ({
    back: jest.fn(),
    replace: jest.fn(),
  }),
}));

const getPressableStyle = (node: { props: { style: unknown } }) => {
  const rawStyle =
    typeof node.props.style === 'function'
      ? node.props.style({ pressed: false })
      : node.props.style;

  return StyleSheet.flatten(rawStyle);
};

describe('Account modal header action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        motto: '끝까지 간다',
        mottos: ['끝까지 간다'],
        role: 'USER',
      },
    });
  });

  it('헤더 저장 버튼으로 한마디 수정 요청을 보낸다', async () => {
    const mutate = jest.fn((_request, options) => {
      options?.onSuccess?.({
        userId: 'test123',
        nickname: 'testuser',
        motto: _request.mottos[0] ?? null,
        mottos: _request.mottos,
        role: 'USER',
      });
    });

    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate,
    });

    const { getByLabelText, getByTestId, getByText } = render(
      <ModalHeaderActionProvider>
        <ModalHeader title="한마디" />
        <Account />
      </ModalHeaderActionProvider>,
    );

    await waitFor(() => {
      expect(getByLabelText('한마디 상단 저장')).toBeOnTheScreen();
    });

    let saveButton = getByLabelText('한마디 상단 저장');
    const saveButtonStyle = getPressableStyle(saveButton);
    const saveButtonTextStyle = StyleSheet.flatten(
      getByText('저장').props.style,
    );

    expect(saveButtonStyle).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.gray[90],
        borderRadius: 8,
        height: 34,
        paddingHorizontal: 0,
        paddingVertical: 0,
        width: 56,
      }),
    );
    expect(saveButtonTextStyle).toEqual(
      expect.objectContaining({
        fontSize: baseFoundation.typography.size.body3,
        fontWeight: baseFoundation.typography.weight.regular,
      }),
    );

    fireEvent.changeText(getByTestId('account-motto-input'), '새 한마디');
    await waitFor(() => {
      saveButton = getByLabelText('한마디 상단 저장');
      expect(getPressableStyle(saveButton).opacity).toBeUndefined();
    });
    fireEvent.press(getByLabelText('한마디 상단 저장'));

    expect(mutate).toHaveBeenCalledWith(
      { mottos: ['새 한마디'] },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('한마디 값에 변경사항이 없으면 헤더 저장 버튼을 비활성화한다', async () => {
    const mutate = jest.fn();
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate,
    });

    const { getByLabelText } = render(
      <ModalHeaderActionProvider>
        <ModalHeader title="한마디" />
        <Account />
      </ModalHeaderActionProvider>,
    );

    await waitFor(() => {
      expect(
        getPressableStyle(getByLabelText('한마디 상단 저장')).opacity,
      ).toBe(0.5);
    });

    fireEvent.press(getByLabelText('한마디 상단 저장'));

    expect(mutate).not.toHaveBeenCalled();
  });

  it('기존 한마디를 모두 제거해도 헤더 저장 버튼으로 저장할 수 있다', async () => {
    const mutate = jest.fn((_request, options) => {
      options?.onSuccess?.({
        userId: 'test123',
        nickname: 'testuser',
        motto: _request.mottos[0] ?? null,
        mottos: _request.mottos,
        role: 'USER',
      });
    });

    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate,
    });

    const { getByLabelText, getByTestId } = render(
      <ModalHeaderActionProvider>
        <ModalHeader title="한마디" />
        <Account />
      </ModalHeaderActionProvider>,
    );

    await waitFor(() => {
      expect(getByLabelText('한마디 상단 저장')).toBeOnTheScreen();
    });

    fireEvent.changeText(getByTestId('account-motto-input'), '');

    await waitFor(() => {
      expect(
        getPressableStyle(getByLabelText('한마디 상단 저장')).opacity,
      ).toBeUndefined();
    });

    fireEvent.press(getByLabelText('한마디 상단 저장'));

    expect(mutate).toHaveBeenCalledWith(
      { mottos: [] },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });
});
