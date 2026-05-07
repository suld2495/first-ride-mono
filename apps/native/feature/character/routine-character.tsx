import {
  Pressable,
  type GestureResponderEvent,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

import {
  getRoutineSceneCharacterAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { StyleSheet } from '@/components/ui/tamagui';
import { useColorScheme } from '@/hooks/useColorScheme';
import { baseFoundation } from '@/theme/tokens';

const ROUTINE_CHARACTER_OFFSET_Y = baseFoundation.spacing[5];

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
  const themeName = useColorScheme();
  const character = renderRoutineSceneAsset(
    getRoutineSceneCharacterAsset(themeName),
    {
      testID,
      style: [styles.image, imageStyle],
    },
  );

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
