import { type ReactNode } from 'react';
import {
  View,
  type TextStyle,
  type ViewProps,
  type StyleProp,
} from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { ThemeName } from '@/theme/themes';
import { baseFoundation, palette } from '@/theme/tokens';

type SpeechBubbleTailPosition = 'bottom' | 'left' | 'right' | 'none';

type CharacterSpeechBubbleProps = ViewProps & {
  children?: ReactNode;
  numberOfLines?: number;
  message?: string;
  tailPosition?: SpeechBubbleTailPosition;
  textStyle?: StyleProp<TextStyle>;
};

const BUBBLE_BORDER_WIDTH = 2;

const speechBubbleBorderColors = {
  light: palette.theme.blue[50],
  dark: palette.theme.blue[50],
  blue: palette.theme.blue[50],
  green: palette.theme.green[50],
  red: palette.theme.red[50],
} satisfies Record<ThemeName, string>;

export const getCharacterSpeechBubbleBorderColor = (themeName: ThemeName) =>
  speechBubbleBorderColors[themeName];

const CharacterSpeechBubble = ({
  children,
  message,
  numberOfLines = 2,
  style,
  tailPosition = 'bottom',
  textStyle,
  testID = 'character-speech-bubble',
  ...props
}: CharacterSpeechBubbleProps) => {
  const themeName = useColorScheme();
  const borderColor = getCharacterSpeechBubbleBorderColor(themeName);

  return (
    <View
      accessibilityRole="text"
      style={[styles.wrapper, style]}
      testID={testID}
      {...props}
    >
      <View
        style={[styles.container, { borderColor }]}
        testID={`${testID}-container`}
      >
        <Typography
          color={palette.gray[800]}
          variant="caption1"
          weight="semibold"
          ellipsizeMode="tail"
          numberOfLines={numberOfLines}
          style={[styles.message, textStyle]}
        >
          {children ?? message}
        </Typography>
      </View>
      {tailPosition !== 'none' && (
        <View
          pointerEvents="none"
          style={[styles.tail, styles[`${tailPosition}Tail`], { borderColor }]}
          testID={`${testID}-tail`}
        />
      )}
    </View>
  );
};

export default CharacterSpeechBubble;

const styles = StyleSheet.create(() => ({
  wrapper: {
    position: 'relative',
    alignSelf: 'center',
    paddingBottom: baseFoundation.spacing[2],
  },
  container: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: baseFoundation.dimension.x96,
    maxWidth: baseFoundation.dimension.x180,
    minHeight: baseFoundation.dimension.x32,
    paddingHorizontal: baseFoundation.spacing[3],
    paddingVertical: baseFoundation.spacing[1],
    borderRadius: baseFoundation.radii.xs,
    borderWidth: BUBBLE_BORDER_WIDTH,
    backgroundColor: palette.white,
    overflow: 'visible',
  },
  message: {
    lineHeight: 16,
    textAlign: 'center',
  },
  tail: {
    position: 'absolute',
    zIndex: 2,
  },
  bottomTail: {
    left: '50%',
    bottom: baseFoundation.dimension.x2,
    marginLeft: -6,
    width: baseFoundation.dimension.x12,
    height: baseFoundation.dimension.x12,
    borderRightWidth: BUBBLE_BORDER_WIDTH,
    borderBottomWidth: BUBBLE_BORDER_WIDTH,
    backgroundColor: palette.white,
    transform: [{ rotate: '45deg' }],
  },
  leftTail: {
    left: -7,
    top: '50%',
    marginTop: -6,
    width: baseFoundation.dimension.x12,
    height: baseFoundation.dimension.x12,
    borderRightWidth: BUBBLE_BORDER_WIDTH,
    borderBottomWidth: BUBBLE_BORDER_WIDTH,
    backgroundColor: palette.white,
    transform: [{ rotate: '45deg' }],
  },
  rightTail: {
    right: -7,
    top: '50%',
    marginTop: -6,
    width: baseFoundation.dimension.x12,
    height: baseFoundation.dimension.x12,
    borderRightWidth: BUBBLE_BORDER_WIDTH,
    borderBottomWidth: BUBBLE_BORDER_WIDTH,
    backgroundColor: palette.white,
    transform: [{ rotate: '45deg' }],
  },
}));
