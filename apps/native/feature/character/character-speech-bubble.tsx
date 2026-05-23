import { useMemo, useState, type ReactNode } from 'react';
import {
  type LayoutChangeEvent,
  View,
  type TextStyle,
  type ViewProps,
  type StyleProp,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { baseFoundation, palette } from '@/theme/tokens';
import type { ThemeName } from '@/theme/themes';

type SpeechBubbleTailPosition = 'bottom' | 'left' | 'right' | 'none';

type CharacterSpeechBubbleProps = ViewProps & {
  children?: ReactNode;
  numberOfLines?: number;
  message?: string;
  tailPosition?: SpeechBubbleTailPosition;
  textStyle?: StyleProp<TextStyle>;
};

const STROKE_WIDTH = 2;
const TAIL_HEIGHT = 13;
const TAIL_WIDTH = 22;
const BUBBLE_RADIUS = 18;

const speechBubbleBorderColors = {
  light: palette.theme.blue[50],
  dark: palette.theme.blue[50],
  blue: palette.theme.blue[50],
  green: palette.theme.green[50],
  red: palette.theme.red[50],
} satisfies Record<ThemeName, string>;

export const getCharacterSpeechBubbleBorderColor = (themeName: ThemeName) =>
  speechBubbleBorderColors[themeName];

const createBubblePath = (width: number, height: number): string => {
  const inset = STROKE_WIDTH / 2;
  const right = width - inset;
  const bottom = height - inset;
  const radius = Math.min(BUBBLE_RADIUS, (height - STROKE_WIDTH) / 2);
  const tailStart = width / 2 - TAIL_WIDTH / 2;
  const tailJoin = width / 2 - 2;
  const tailTipX = width / 2 + 12;
  const tailTipY = bottom + TAIL_HEIGHT;

  return [
    `M ${radius} ${inset}`,
    `H ${right - radius}`,
    `Q ${right} ${inset} ${right} ${radius}`,
    `V ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `H ${tailJoin}`,
    `C ${tailJoin + 1} ${bottom + 5} ${tailTipX - 3} ${tailTipY - 1} ${tailTipX} ${tailTipY}`,
    `C ${tailTipX - 6} ${tailTipY + 1} ${tailStart + 2} ${bottom + 6} ${tailStart} ${bottom}`,
    `H ${radius}`,
    `Q ${inset} ${bottom} ${inset} ${bottom - radius}`,
    `V ${radius}`,
    `Q ${inset} ${inset} ${radius} ${inset}`,
    'Z',
  ].join(' ');
};

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
  const [bubbleSize, setBubbleSize] = useState({ width: 0, height: 0 });
  const bubblePath = useMemo(() => {
    if (bubbleSize.width <= 0 || bubbleSize.height <= 0) {
      return '';
    }

    return createBubblePath(bubbleSize.width, bubbleSize.height);
  }, [bubbleSize.height, bubbleSize.width]);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;

    setBubbleSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  return (
    <View
      accessibilityRole="text"
      style={[styles.wrapper, style]}
      testID={testID}
      {...props}
    >
      {tailPosition === 'bottom' && bubblePath && (
        <Svg
          width={bubbleSize.width}
          height={bubbleSize.height + TAIL_HEIGHT + STROKE_WIDTH}
          pointerEvents="none"
          style={styles.bubbleBackground}
          viewBox={`0 0 ${bubbleSize.width} ${
            bubbleSize.height + TAIL_HEIGHT + STROKE_WIDTH
          }`}
        >
          <Path
            d={bubblePath}
            fill={palette.white}
            stroke={borderColor}
            strokeLinejoin="round"
            strokeWidth={STROKE_WIDTH}
          />
        </Svg>
      )}
      <View
        style={[
          styles.container,
          { borderColor },
          tailPosition === 'bottom' && styles.bottomTailContainer,
          tailPosition === 'bottom' && bubblePath && styles.transparentBubble,
        ]}
        onLayout={handleContainerLayout}
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
      {tailPosition !== 'none' && tailPosition !== 'bottom' && (
        <View
          pointerEvents="none"
          style={[
            styles.tail,
            styles[`${tailPosition}Tail`],
            { borderColor },
          ]}
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
    paddingBottom: TAIL_HEIGHT,
  },
  container: {
    position: 'relative',
    zIndex: 1,
    justifyContent: 'center',
    maxWidth: baseFoundation.dimension.x180,
    minHeight: baseFoundation.dimension.x40,
    paddingHorizontal: baseFoundation.spacing[4],
    paddingVertical: baseFoundation.spacing[2],
    borderRadius: baseFoundation.radii.m,
    borderWidth: 2,
    backgroundColor: palette.white,
    overflow: 'visible',
  },
  bottomTailContainer: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  transparentBubble: {
    backgroundColor: 'transparent',
  },
  bubbleBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  message: {
    lineHeight: 18,
    textAlign: 'center',
  },
  tail: {
    position: 'absolute',
    zIndex: 2,
  },
  leftTail: {
    left: -7,
    top: '50%',
    marginTop: -6,
    width: baseFoundation.dimension.x12,
    height: baseFoundation.dimension.x12,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    backgroundColor: palette.white,
    transform: [{ rotate: '45deg' }],
  },
  rightTail: {
    right: -7,
    top: '50%',
    marginTop: -6,
    width: baseFoundation.dimension.x12,
    height: baseFoundation.dimension.x12,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    backgroundColor: palette.white,
    transform: [{ rotate: '45deg' }],
  },
}));
