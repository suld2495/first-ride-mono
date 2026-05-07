import type {
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from 'react-native';
import { Image } from 'react-native';

import type { ThemeName } from '@/theme/themes';

export type RoutineSceneAsset = {
  source: ImageSourcePropType;
};

const blueCharacterAsset = {
  source: require('@/assets/routine/character-blue.png'),
} satisfies RoutineSceneAsset;

const blueBackgroundAsset = {
  source: require('@/assets/routine/background.png'),
} satisfies RoutineSceneAsset;

const bluePreviewOverlayAsset = {
  source: require('@/assets/routine/preview-overlay.png'),
} satisfies RoutineSceneAsset;

export const routineSceneAssets = {
  background: blueBackgroundAsset,
  character: blueCharacterAsset,
  previewOverlay: bluePreviewOverlayAsset,
} satisfies Record<
  'background' | 'character' | 'previewOverlay',
  RoutineSceneAsset
>;

export const routineSceneBackgroundAssets = {
  light: blueBackgroundAsset,
  dark: blueBackgroundAsset,
  blue: blueBackgroundAsset,
  green: {
    source: require('@/assets/routine/background-green.png'),
  },
  red: {
    source: require('@/assets/routine/background-red.png'),
  },
} satisfies Record<ThemeName, RoutineSceneAsset>;

export const routineSceneCharacterAssets = {
  light: blueCharacterAsset,
  dark: blueCharacterAsset,
  blue: blueCharacterAsset,
  green: {
    source: require('@/assets/routine/character-green.png'),
  },
  red: {
    source: require('@/assets/routine/character-red.png'),
  },
} satisfies Record<ThemeName, RoutineSceneAsset>;

export const routineScenePreviewOverlayAssets = {
  light: bluePreviewOverlayAsset,
  dark: bluePreviewOverlayAsset,
  blue: bluePreviewOverlayAsset,
  green: {
    source: require('@/assets/routine/preview-overlay-green.png'),
  },
  red: {
    source: require('@/assets/routine/preview-overlay-red.png'),
  },
} satisfies Record<ThemeName, RoutineSceneAsset>;

export const getRoutineSceneCharacterAsset = (themeName: ThemeName) =>
  routineSceneCharacterAssets[themeName] ?? blueCharacterAsset;

export const getRoutineSceneBackgroundAsset = (themeName: ThemeName) =>
  routineSceneBackgroundAssets[themeName] ?? blueBackgroundAsset;

export const getRoutineScenePreviewOverlayAsset = (themeName: ThemeName) =>
  routineScenePreviewOverlayAssets[themeName] ?? bluePreviewOverlayAsset;

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
