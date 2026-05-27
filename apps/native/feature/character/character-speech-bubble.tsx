import { type ReactNode } from 'react';
import {
  View,
  type TextStyle,
  type ViewProps,
  type StyleProp,
  useWindowDimensions,
} from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
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
const BUBBLE_MIN_WIDTH = baseFoundation.dimension.x96;
const SCREEN_HORIZONTAL_MARGIN = 17.5;

const speechBubbleBorderColors = {
  light: palette.theme.blue[50],
  dark: palette.theme.blue[50],
  blue: palette.theme.blue[50],
  green: palette.theme.green[50],
  red: palette.theme.red[50],
} satisfies Record<ThemeName, string>;

export const getCharacterSpeechBubbleBorderColor = (themeName: ThemeName) =>
  speechBubbleBorderColors[themeName];

export const getCharacterSpeechBubbleMaxWidth = (windowWidth: number) =>
  Math.max(BUBBLE_MIN_WIDTH, windowWidth - SCREEN_HORIZONTAL_MARGIN * 2);

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
  const { theme } = useAppTheme();
  const themeName = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();
  const borderColor = getCharacterSpeechBubbleBorderColor(themeName);
  const maxWidth = getCharacterSpeechBubbleMaxWidth(windowWidth);

  return (
    <View
      accessibilityRole="text"
      style={[styles.wrapper, style]}
      testID={testID}
      {...props}
    >
      <View
        style={[styles.container, { borderColor, maxWidth }]}
        testID={`${testID}-container`}
      >
        <Typography
          color={theme.colors.text.gray}
          variant="body3"
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
    minWidth: BUBBLE_MIN_WIDTH,
    minHeight: baseFoundation.dimension.x32,
    paddingHorizontal: baseFoundation.spacing[4],
    paddingVertical: baseFoundation.spacing[2],
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
