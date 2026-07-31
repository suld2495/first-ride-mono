import {
  Pressable,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

import PencilIcon from '@/components/icons/pencil-icon';
import { useAppTheme } from '@/components/ui/tamagui';
import CharacterSpeechBubble, {
  getCharacterSpeechBubbleMaxWidth,
} from '@/feature/character/character-speech-bubble';
import { baseFoundation } from '@/theme/tokens';

type CharacterMottoSpeechBubbleBaseProps = {
  message: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type CharacterMottoSpeechBubbleProps = CharacterMottoSpeechBubbleBaseProps &
  (
    | {
        isMine: true;
        onEdit: () => void;
      }
    | {
        isMine?: false;
        onEdit?: never;
      }
  );

const CharacterMottoSpeechBubble = ({
  isMine = false,
  message,
  onEdit,
  style,
  testID = 'character-motto-speech-bubble',
}: CharacterMottoSpeechBubbleProps) => {
  const { theme } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const wrapperStyle = [
    { width: getCharacterSpeechBubbleMaxWidth(windowWidth) },
    style,
  ];
  const content = (
    <CharacterSpeechBubble
      message={message}
      testID={`${testID}-content`}
      trailingIcon={
        isMine ? (
          <PencilIcon
            color={theme.colors.text.soft}
            height={baseFoundation.iconSize.s}
            opacity={0.45}
            testID="character-motto-speech-bubble-edit-icon"
            width={baseFoundation.iconSize.s}
          />
        ) : undefined
      }
    />
  );

  if (isMine) {
    return (
      <Pressable
        accessibilityLabel="한마디 수정"
        accessibilityRole="button"
        onPress={onEdit}
        style={wrapperStyle}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View pointerEvents="none" style={wrapperStyle} testID={testID}>
      {content}
    </View>
  );
};

export default CharacterMottoSpeechBubble;
