import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useColorSchemeStore } from '@/store/color-scheme.store';
import { baseFoundation, palette } from '@/theme/tokens';

import Account from '../../app/account';
import { render } from '../setup/test-utils';

jest.mock('@repo/shared/hooks/useUser', () => ({
  useFetchMeQuery: jest.fn(),
  useUpdateMottoMutation: jest.fn(),
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

describe('Account', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useColorScheme as jest.Mock).mockReturnValue('light');
    useColorSchemeStore.getState().setColorScheme('dark');
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        motto: '끝까지 간다',
        mottos: ['끝까지 간다'],
        role: 'USER',
        characterImageUrl: 'https://cdn.example.com/characters/warrior.png',
        backgroundImageUrl: 'https://cdn.example.com/backgrounds/warrior.webp',
      },
    });
  });

  it('계정 캐릭터를 100x100 크기로 보여준다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = render(<Account />);
    const characterStyle = StyleSheet.flatten(
      getByTestId('account-character').props.style,
    );

    expect(characterStyle).toEqual(
      expect.objectContaining({
        height: 100,
        width: 100,
      }),
    );
  });

  it('GET /users/me의 캐릭터 URL을 계정 캐릭터로 보여준다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = render(<Account />);

    expect(getByTestId('account-character')).toHaveProp('source', {
      uri: 'https://cdn.example.com/characters/warrior.png',
    });
  });

  it('계정 캐릭터 컨테이너를 테마 5번 컬러의 138x138 박스로 보여준다', () => {
    useColorSchemeStore.getState().setColorScheme('blue');
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = render(<Account />);
    const characterContainerStyle = StyleSheet.flatten(
      getByTestId('account-character-container').props.style,
    );

    expect(characterContainerStyle).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.blue[5],
        borderRadius: 12,
        height: 138,
        width: 138,
      }),
    );
    expect(characterContainerStyle.borderWidth).toBeUndefined();
  });

  it('헤더와 캐릭터 컨테이너 사이 간격을 12로 보여준다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = render(<Account />);
    const contentStyle = StyleSheet.flatten(
      getByTestId('account-content').props.style,
    );

    expect(contentStyle.paddingTop).toBe(12);
  });

  it('캐릭터 컨테이너 아래에 테마 컬러 보더의 한마디 입력을 보여준다', () => {
    useColorSchemeStore.getState().setColorScheme('blue');
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByPlaceholderText, getByTestId } = render(<Account />);
    const inputWrapperStyle = StyleSheet.flatten(
      getByTestId('account-motto-input-wrapper').props.style,
    );
    const inputContainerStyle = StyleSheet.flatten(
      getByTestId('account-motto-input-container').props.style,
    );
    const inputStyle = StyleSheet.flatten(
      getByTestId('account-motto-input').props.style,
    );

    expect(getByTestId('account-motto-input').props.value).toBe('끝까지 간다');
    expect(getByPlaceholderText('한마디를 입력하세요')).toBeOnTheScreen();
    expect(inputWrapperStyle).toEqual(
      expect.objectContaining({
        marginTop: 16,
        width: '100%',
      }),
    );
    expect(inputWrapperStyle.paddingHorizontal).toBeUndefined();
    expect(inputContainerStyle).toEqual(
      expect.objectContaining({
        borderColor: palette.theme.blue[50],
        borderWidth: 2,
        borderRadius: 12,
        height: 44,
      }),
    );
    expect(inputStyle).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[70],
        fontSize: baseFoundation.typography.size.body2,
        fontWeight: baseFoundation.typography.weight.semibold,
        paddingHorizontal: 20,
        paddingVertical: 12,
        textAlign: 'center',
      }),
    );
  });

  it('캐릭터 컨테이너 아래 한마디 입력값을 변경할 수 있다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = render(<Account />);
    const mottoInput = getByTestId('account-motto-input');

    fireEvent.changeText(mottoInput, '바뀐 한마디');

    expect(mottoInput.props.value).toBe('바뀐 한마디');
  });

  it('한마디 입력은 80byte를 넘는 문자를 입력할 수 없다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = render(<Account />);
    const mottoInput = getByTestId('account-motto-input');
    const eightyBytes =
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890';

    fireEvent.changeText(mottoInput, `${eightyBytes}1`);

    expect(mottoInput.props.value).toBe(eightyBytes);

    fireEvent.changeText(mottoInput, `${'가'.repeat(26)}ab나`);

    expect(mottoInput.props.value).toBe(`${'가'.repeat(26)}ab`);
  });

  it('한마디 입력 아래에 현재 byte 수와 최대 byte 수를 표시한다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = render(<Account />);
    const mottoInput = getByTestId('account-motto-input');

    expect(getByTestId('account-motto-byte-counter').props.children).toEqual([
      16,
      ' / 80byte',
    ]);

    fireEvent.changeText(mottoInput, 'abc가');

    expect(getByTestId('account-motto-byte-counter').props.children).toEqual([
      6,
      ' / 80byte',
    ]);
  });

  it('새 한마디 입력 아래 기존 목록 영역을 보여주지 않는다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { queryByLabelText, queryByText } = render(<Account />);

    expect(queryByLabelText('한마디 추가')).toBeNull();
    expect(queryByLabelText('끝까지 간다 수정')).toBeNull();
    expect(queryByLabelText('끝까지 간다 삭제')).toBeNull();
    expect(queryByText('testuser')).toBeNull();
  });
});
