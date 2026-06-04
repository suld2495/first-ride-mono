import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import CharacterSpeechBubble, {
  getCharacterSpeechBubbleMaxWidth,
  getCharacterSpeechBubbleBorderColor,
} from '@/feature/character/character-speech-bubble';
import { palette } from '@/theme/tokens';

let mockThemeName = 'green';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => mockThemeName,
}));

describe('CharacterSpeechBubble', () => {
  beforeEach(() => {
    mockThemeName = 'green';
  });

  it('테마별 50 컬러를 말풍선 border 컬러로 사용한다', () => {
    expect(getCharacterSpeechBubbleBorderColor('blue')).toBe(
      palette.theme.blue[50],
    );
    expect(getCharacterSpeechBubbleBorderColor('green')).toBe(
      palette.theme.green[50],
    );
    expect(getCharacterSpeechBubbleBorderColor('red')).toBe(
      palette.theme.red[50],
    );
  });

  it('이미지 시안처럼 작은 둥근 사각형 말풍선으로 표시한다', () => {
    const { getByTestId } = render(<CharacterSpeechBubble message="한마디" />);
    const bubbleContainer = getByTestId('character-speech-bubble-container');

    expect(StyleSheet.flatten(bubbleContainer.props.style)).toEqual(
      expect.objectContaining({
        minWidth: 96,
        minHeight: 32,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: palette.theme.green[50],
        backgroundColor: palette.white,
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: 8,
      }),
    );
  });

  it('최대 너비는 화면 좌우에 17.5 여백을 남긴다', () => {
    expect(getCharacterSpeechBubbleMaxWidth(360)).toBe(325);
    expect(getCharacterSpeechBubbleMaxWidth(390)).toBe(355);
  });

  it('기본 말풍선은 하단 중앙 말꼬리를 표시한다', () => {
    const { getByTestId } = render(<CharacterSpeechBubble message="한마디" />);
    const bubbleTail = getByTestId('character-speech-bubble-tail');

    expect(StyleSheet.flatten(bubbleTail.props.style)).toEqual(
      expect.objectContaining({
        left: '50%',
        bottom: 2,
        width: 12,
        height: 12,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderColor: palette.theme.green[50],
        backgroundColor: palette.white,
      }),
    );
  });

  it('말풍선 텍스트는 body3 semibold와 skin gray 90 컬러를 사용한다', () => {
    const { getByText } = render(<CharacterSpeechBubble message="한마디" />);
    const message = getByText('한마디');

    expect(message.props.fontSize).toBe('$body3');
    expect(message.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(message.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[90],
      }),
    );
  });
});
