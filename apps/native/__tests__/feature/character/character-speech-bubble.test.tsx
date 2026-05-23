import { View } from 'react-native';
import { Path } from 'react-native-svg';

import CharacterSpeechBubble, {
  getCharacterSpeechBubbleBorderColor,
} from '@/feature/character/character-speech-bubble';
import { palette } from '@/theme/tokens';
import { fireEvent, render } from '@testing-library/react-native';

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

  it('현재 테마의 50 컬러를 말풍선 stroke에 적용한다', () => {
    const { UNSAFE_getAllByType } = render(
      <CharacterSpeechBubble message="안녕?" />,
    );
    const bubbleContainer = UNSAFE_getAllByType(View).find(
      (node) => typeof node.props.onLayout === 'function',
    );

    expect(bubbleContainer).toBeTruthy();

    fireEvent(bubbleContainer!, 'layout', {
      nativeEvent: {
        layout: {
          width: 120,
          height: 48,
        },
      },
    });

    expect(UNSAFE_getAllByType(Path)[0].props.stroke).toBe(
      palette.theme.green[50],
    );
  });
});
