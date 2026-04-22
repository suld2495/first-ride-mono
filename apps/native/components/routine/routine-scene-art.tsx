import type {
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from 'react-native';
import { Image } from 'react-native';

export type RoutineSceneAsset = {
  source: ImageSourcePropType;
};

export const routineSceneAssets = {
  background: {
    source: require('@/assets/routine/background.png'),
  },
  character: {
    source: require('@/assets/routine/character.png'),
  },
} satisfies Record<'background' | 'character', RoutineSceneAsset>;

export const renderRoutineSceneAsset = (
  asset: RoutineSceneAsset,
  props?: {
    testID?: string;
    style?: StyleProp<ImageStyle>;
    resizeMode?: ImageResizeMode;
  },
) => (
  <Image
    source={asset.source}
    testID={props?.testID}
    style={props?.style}
    resizeMode={props?.resizeMode ?? 'contain'}
  />
);
