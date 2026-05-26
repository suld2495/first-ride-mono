import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import * as routineSceneArt from '@/components/routine/routine-scene-art';
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

  it('계정 캐릭터를 현재 테마에 맞게 보여준다', () => {
    (useColorScheme as jest.Mock).mockReturnValue('green');
    const getCharacterAssetSpy = jest.spyOn(
      routineSceneArt,
      'getRoutineSceneCharacterAsset',
    );
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    render(<Account />);

    expect(getCharacterAssetSpy).toHaveBeenCalledWith('green');

    getCharacterAssetSpy.mockRestore();
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
