import {
  Pressable,
  type GestureResponderEvent,
  type ImageStyle,
  type StyleProp,
  useWindowDimensions,
} from 'react-native';

import {
  type RoutineSceneAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

const ROUTINE_CHARACTER_OFFSET_Y = baseFoundation.spacing[5];
const ROUTINE_CHARACTER_BASE_SCREEN_WIDTH = 393;
const ROUTINE_CHARACTER_BASE_SIZE = 148;
const ROUTINE_CHARACTER_MIN_SIZE = 140;
const ROUTINE_CHARACTER_MAX_SIZE = 156;
const ROUTINE_CHARACTER_WIDTH_SCALE = 0.25;

const getRoutineCharacterSize = (screenWidth: number) =>
  Math.min(
    ROUTINE_CHARACTER_MAX_SIZE,
    Math.max(
      ROUTINE_CHARACTER_MIN_SIZE,
      Math.round(
        ROUTINE_CHARACTER_BASE_SIZE +
          (screenWidth - ROUTINE_CHARACTER_BASE_SCREEN_WIDTH) *
            ROUTINE_CHARACTER_WIDTH_SCALE,
      ),
    ),
  );

type RoutineCharacterProps = {
  accessibilityLabel?: string;
  asset: RoutineSceneAsset;
  imageStyle?: StyleProp<ImageStyle>;
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
};

const RoutineCharacter = ({
  accessibilityLabel = '루틴 캐릭터',
  asset,
  imageStyle,
  onPress,
  testID = 'routine-scene-character',
}: RoutineCharacterProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const characterSize = getRoutineCharacterSize(screenWidth);
  const character = renderRoutineSceneAsset(asset, {
    testID,
    style: [
      styles.image,
      { width: characterSize, height: characterSize },
      imageStyle,
    ],
  });

  if (!onPress) {
    return character;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      testID="routine-character-button"
    >
      {character}
    </Pressable>
  );
};

export default RoutineCharacter;

const styles = StyleSheet.create(() => ({
  image: {
    transform: [{ translateY: ROUTINE_CHARACTER_OFFSET_Y }],
  },
}));
