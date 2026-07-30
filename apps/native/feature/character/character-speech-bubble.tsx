import { type ReactNode, useCallback, useState } from 'react';
import {
  View,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
  type TextStyle,
  type ViewProps,
  type StyleProp,
  useWindowDimensions,
} from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { Typography, type TypographyVariant } from '@/components/ui/typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { ThemeName } from '@/theme/themes';
import { baseFoundation, palette } from '@/theme/tokens';

type SpeechBubbleTailPosition = 'bottom' | 'left' | 'right' | 'none';

type CharacterSpeechBubbleProps = ViewProps & {
  children?: ReactNode;
  containerMinHeight?: number | null;
  containerMinWidth?: number;
  containerPaddingBottom?: number;
  containerPaddingHorizontal?: number;
  containerPaddingTop?: number;
  containerPaddingVertical?: number;
  maxWidth?: number;
  numberOfLines?: number;
  message?: string;
  singleLinePaddingTop?: number;
  tailPosition?: SpeechBubbleTailPosition;
  textStyle?: StyleProp<TextStyle>;
  textVariant?: TypographyVariant;
  themeName?: ThemeName;
  trailingIcon?: ReactNode;
  wrapperTop?: number;
  singleLineWrapperTop?: number;
};

const BUBBLE_BORDER_WIDTH = 2;
const BUBBLE_MIN_WIDTH = baseFoundation.dimension.x96;
const BUBBLE_DEFAULT_MIN_HEIGHT = baseFoundation.dimension.x32;
const BUBBLE_DEFAULT_PADDING_HORIZONTAL = baseFoundation.spacing[4];
const BUBBLE_DEFAULT_PADDING_VERTICAL = baseFoundation.spacing[2];
const BUBBLE_TAIL_SIZE = baseFoundation.dimension.x8;
const BUBBLE_TAIL_HALF_SIZE = BUBBLE_TAIL_SIZE / 2;
const BUBBLE_SIDE_TAIL_OFFSET = -(BUBBLE_TAIL_HALF_SIZE + BUBBLE_BORDER_WIDTH);
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
  containerMinHeight = BUBBLE_DEFAULT_MIN_HEIGHT,
  containerMinWidth = BUBBLE_MIN_WIDTH,
  containerPaddingBottom,
  containerPaddingHorizontal = BUBBLE_DEFAULT_PADDING_HORIZONTAL,
  containerPaddingTop,
  containerPaddingVertical = BUBBLE_DEFAULT_PADDING_VERTICAL,
  maxWidth: maxWidthOverride,
  message,
  numberOfLines = 2,
  singleLinePaddingTop,
  style,
  tailPosition = 'bottom',
  textStyle,
  textVariant = 'body3',
  themeName: themeNameOverride,
  trailingIcon,
  wrapperTop,
  singleLineWrapperTop,
  testID = 'character-speech-bubble',
  ...props
}: CharacterSpeechBubbleProps) => {
  const { theme } = useAppTheme();
  const themeName = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();
  const [renderedLineCount, setRenderedLineCount] = useState(numberOfLines);
  const borderColor = getCharacterSpeechBubbleBorderColor(
    themeNameOverride ?? themeName,
  );
  const maxWidth =
    maxWidthOverride ?? getCharacterSpeechBubbleMaxWidth(windowWidth);
  const defaultPaddingTop = containerPaddingTop ?? containerPaddingVertical;
  const paddingTop =
    renderedLineCount <= 1 && singleLinePaddingTop !== undefined
      ? singleLinePaddingTop
      : defaultPaddingTop;
  const top =
    renderedLineCount <= 1 && singleLineWrapperTop !== undefined
      ? singleLineWrapperTop
      : wrapperTop;
  const wrapperPositionStyle = top === undefined ? undefined : { top };
  const containerLayoutStyle = {
    borderColor,
    maxWidth,
    minWidth: containerMinWidth,
    paddingBottom: containerPaddingBottom ?? containerPaddingVertical,
    paddingHorizontal: containerPaddingHorizontal,
    paddingTop,
    ...(containerMinHeight === null ? {} : { minHeight: containerMinHeight }),
  };
  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      setRenderedLineCount(
        Math.min(event.nativeEvent.lines.length, numberOfLines),
      );
    },
    [numberOfLines],
  );

  return (
    <View
      accessibilityRole="text"
      style={[styles.wrapper, style, wrapperPositionStyle]}
      testID={testID}
      {...props}
    >
      <View
        style={[styles.container, containerLayoutStyle]}
        testID={`${testID}-container`}
      >
        <View style={styles.messageRow}>
          <Typography
            color={theme.colors.text.gray}
            variant={textVariant}
            weight="semibold"
            ellipsizeMode="tail"
            numberOfLines={numberOfLines}
            onTextLayout={handleTextLayout}
            textAlign="center"
            style={[styles.message, textStyle]}
          >
            {children ?? message}
          </Typography>
          {trailingIcon ? (
            <View style={styles.trailingIcon}>{trailingIcon}</View>
          ) : null}
        </View>
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
    borderRadius: baseFoundation.radii.xs,
    borderWidth: BUBBLE_BORDER_WIDTH,
    backgroundColor: palette.white,
    overflow: 'visible',
  },
  message: {
    flexShrink: 1,
    lineHeight: 16,
    textAlign: 'center',
  },
  messageRow: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingIcon: {
    marginLeft: baseFoundation.spacing[1],
  },
  tail: {
    position: 'absolute',
    zIndex: 2,
  },
  bottomTail: {
    left: '50%',
    bottom: baseFoundation.dimension.x4,
    marginLeft: -BUBBLE_TAIL_HALF_SIZE,
    width: BUBBLE_TAIL_SIZE,
    height: BUBBLE_TAIL_SIZE,
    borderRightWidth: BUBBLE_BORDER_WIDTH,
    borderBottomWidth: BUBBLE_BORDER_WIDTH,
    backgroundColor: palette.white,
    transform: [{ rotate: '45deg' }],
  },
  leftTail: {
    left: BUBBLE_SIDE_TAIL_OFFSET,
    top: '50%',
    marginTop: -BUBBLE_TAIL_HALF_SIZE,
    width: BUBBLE_TAIL_SIZE,
    height: BUBBLE_TAIL_SIZE,
    borderRightWidth: BUBBLE_BORDER_WIDTH,
    borderBottomWidth: BUBBLE_BORDER_WIDTH,
    backgroundColor: palette.white,
    transform: [{ rotate: '45deg' }],
  },
  rightTail: {
    right: BUBBLE_SIDE_TAIL_OFFSET,
    top: '50%',
    marginTop: -BUBBLE_TAIL_HALF_SIZE,
    width: BUBBLE_TAIL_SIZE,
    height: BUBBLE_TAIL_SIZE,
    borderRightWidth: BUBBLE_BORDER_WIDTH,
    borderBottomWidth: BUBBLE_BORDER_WIDTH,
    backgroundColor: palette.white,
    transform: [{ rotate: '45deg' }],
  },
}));
