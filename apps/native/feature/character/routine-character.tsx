import {
  Pressable,
  type GestureResponderEvent,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

import {
  renderRoutineSceneAsset,
  routineSceneAssets,
} from '@/components/routine/routine-scene-art';
import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

const ROUTINE_CHARACTER_OFFSET_Y = 20;

type RoutineCharacterProps = {
  accessibilityLabel?: string;
  imageStyle?: StyleProp<ImageStyle>;
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
};

const RoutineCharacter = ({
  accessibilityLabel = '루틴 캐릭터',
  imageStyle,
  onPress,
  testID = 'routine-scene-character',
}: RoutineCharacterProps) => {
  const character = renderRoutineSceneAsset(routineSceneAssets.character, {
    testID,
    style: [styles.image, imageStyle],
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
    width: baseFoundation.dimension.x112,
    height: baseFoundation.dimension.x120,
    transform: [{ translateY: ROUTINE_CHARACTER_OFFSET_Y }],
  },
}));
