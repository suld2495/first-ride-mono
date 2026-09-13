import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import ModalHeaderActionProvider from '@/components/modal/modal-header-action-provider';
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

// 단독 라우트(/account)에서는 ModalHeader가 router.canGoBack()을 호출하므로 router 객체를 함께 제공한다.
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    canGoBack: () => true,
    replace: jest.fn(),
  },
  useRouter: () => ({
    back: jest.fn(),
    dismissTo: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// 앱에서는 /modal?type=account 로 열리므로 모달 헤더 액션 컨텍스트 안에서 렌더링한다.
const renderAccount = () =>
  render(
    <ModalHeaderActionProvider>
      <Account />
    </ModalHeaderActionProvider>,
  );

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

  it('계정 캐릭터를 112x112 크기로 보여주고 12px 위로 올린다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = renderAccount();
    const characterStyle = StyleSheet.flatten(
      getByTestId('account-character').props.style,
    );

    expect(characterStyle).toEqual(
      expect.objectContaining({
        height: 112,
        transform: [{ translateY: -12 }],
        width: 112,
      }),
    );
  });

  it('GET /users/me의 캐릭터 URL을 계정 캐릭터로 보여준다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = renderAccount();

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

    const { getByTestId } = renderAccount();
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

  it('헤더와 캐릭터 컨테이너 사이 위쪽 패딩을 두지 않는다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = renderAccount();
    const contentStyle = StyleSheet.flatten(
      getByTestId('account-content').props.style,
    );

    expect(contentStyle.paddingTop).toBe(0);
  });

  it('캐릭터 컨테이너 아래에 테마 컬러 보더의 한마디 입력을 보여준다', () => {
    useColorSchemeStore.getState().setColorScheme('blue');
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByPlaceholderText, getByTestId } = renderAccount();
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
        color: palette.theme.gray[40],
        fontSize: baseFoundation.typography.size.body2,
        fontWeight: baseFoundation.typography.weight.semibold,
        paddingHorizontal: 24,
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

    const { getByTestId } = renderAccount();
    const mottoInput = getByTestId('account-motto-input');

    fireEvent.changeText(mottoInput, '바뀐 한마디');

    expect(mottoInput.props.value).toBe('바뀐 한마디');
  });

  it('한마디 입력은 네이티브 입력 단계에서 26자로 제한한다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = renderAccount();

    expect(getByTestId('account-motto-input')).toHaveProp('maxLength', 26);
  });

  it('한마디 입력은 공백을 유지한다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = renderAccount();
    const mottoInput = getByTestId('account-motto-input');

    fireEvent.changeText(mottoInput, '공백 포함 한마디');

    expect(mottoInput).toHaveProp('value', '공백 포함 한마디');
  });

  it('한마디 입력 아래에 현재 글자 수와 최대 한글 글자 수를 표시한다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId } = renderAccount();
    const mottoInput = getByTestId('account-motto-input');

    expect(getByTestId('account-motto-byte-counter')).toHaveTextContent(
      '6/26자',
    );

    fireEvent.changeText(mottoInput, 'abc가');

    expect(getByTestId('account-motto-byte-counter')).toHaveTextContent(
      '4/26자',
    );
  });

  it('한마디 글자 수는 테마별 soft 80 컬러로 표시한다', () => {
    useColorSchemeStore.getState().setColorScheme('green');
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByTestId, rerender } = renderAccount();

    expect(
      StyleSheet.flatten(getByTestId('account-motto-byte-counter').props.style),
    ).toEqual(
      expect.objectContaining({
        color: palette.theme.softGreen[80],
      }),
    );

    useColorSchemeStore.getState().setColorScheme('red');
    rerender(
      <ModalHeaderActionProvider>
        <Account />
      </ModalHeaderActionProvider>,
    );

    expect(
      StyleSheet.flatten(getByTestId('account-motto-byte-counter').props.style),
    ).toEqual(
      expect.objectContaining({
        color: palette.theme.softRed[80],
      }),
    );
  });

  it('모달 래퍼 없이 열리면 안전영역·헤더·저장 버튼을 갖춘 단독 화면으로 보여준다', async () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByLabelText, getByTestId, getByText } = render(<Account />);

    expect(getByTestId('account-standalone-screen')).toBeOnTheScreen();
    expect(getByText('한마디')).toBeOnTheScreen();
    expect(getByLabelText('뒤로가기')).toBeOnTheScreen();
    expect(
      StyleSheet.flatten(getByTestId('account-standalone-content').props.style)
        .paddingHorizontal,
    ).toBe(baseFoundation.spacing[6]);

    await waitFor(() => {
      expect(getByLabelText('한마디 상단 저장')).toBeOnTheScreen();
    });
    expect(getByText('저장')).toBeOnTheScreen();
  });

  it('모달 래퍼 안에서는 단독 화면 껍데기를 만들지 않는다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { queryByTestId } = renderAccount();

    expect(queryByTestId('account-standalone-screen')).toBeNull();
  });

  it('새 한마디 입력 아래 기존 목록 영역을 보여주지 않는다', () => {
    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { queryByLabelText, queryByText } = renderAccount();

    expect(queryByLabelText('한마디 추가')).toBeNull();
    expect(queryByLabelText('끝까지 간다 수정')).toBeNull();
    expect(queryByLabelText('끝까지 간다 삭제')).toBeNull();
    expect(queryByText('testuser')).toBeNull();
  });
});
