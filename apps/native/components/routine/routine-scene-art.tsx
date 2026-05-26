import type { ComponentType } from 'react';
import type {
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from 'react-native';
import { Image, StyleSheet as RNStyleSheet } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import {
  ArcherRoutineCharacterIcon,
  MageRoutineCharacterIcon,
  type RoutineCharacterIconProps,
  WarriorRoutineCharacterIcon,
} from '@/components/icons/routine-character-icons';
import type { ThemeName } from '@/theme/themes';

const routineBackgroundSource =
  require('@/assets/routine/background.png') as ImageSourcePropType;
const routinePreviewOverlaySource =
  require('@/assets/routine/preview-overlay.png') as ImageSourcePropType;
const routineGreenBackgroundSource =
  require('@/assets/routine/background-green.png') as ImageSourcePropType;
const routineRedBackgroundSource =
  require('@/assets/routine/background-red.png') as ImageSourcePropType;
const routineGreenPreviewOverlaySource =
  require('@/assets/routine/preview-overlay-green.png') as ImageSourcePropType;
const routineRedPreviewOverlaySource =
  require('@/assets/routine/preview-overlay-red.png') as ImageSourcePropType;

export type RoutineSceneAsset = {
  Character?: ComponentType<RoutineCharacterIconProps>;
  source?: ImageSourcePropType;
};

const blueCharacterAsset = {
  Character: WarriorRoutineCharacterIcon,
} satisfies RoutineSceneAsset;

const blueBackgroundAsset = {
  source: routineBackgroundSource,
} satisfies RoutineSceneAsset;

const bluePreviewOverlayAsset = {
  source: routinePreviewOverlaySource,
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
    source: routineGreenBackgroundSource,
  },
  red: {
    source: routineRedBackgroundSource,
  },
} satisfies Record<ThemeName, RoutineSceneAsset>;

export const routineSceneCharacterAssets = {
  light: blueCharacterAsset,
  dark: blueCharacterAsset,
  blue: blueCharacterAsset,
  green: {
    Character: ArcherRoutineCharacterIcon,
  },
  red: {
    Character: MageRoutineCharacterIcon,
  },
} satisfies Record<ThemeName, RoutineSceneAsset>;

export const routineScenePreviewOverlayAssets = {
  light: bluePreviewOverlayAsset,
  dark: bluePreviewOverlayAsset,
  blue: bluePreviewOverlayAsset,
  green: {
    source: routineGreenPreviewOverlaySource,
  },
  red: {
    source: routineRedPreviewOverlaySource,
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
) => {
  if (asset.Character) {
    const { Character } = asset;
    const style = RNStyleSheet.flatten(props?.style);
    const height =
      typeof style?.height === 'number' || typeof style?.height === 'string'
        ? style.height
        : undefined;
    const width =
      typeof style?.width === 'number' || typeof style?.width === 'string'
        ? style.width
        : undefined;

    return (
      <Character
        height={height}
        testID={props?.testID}
        style={props?.style as SvgProps['style']}
        width={width}
      />
    );
  }

  return (
    <Image
      source={asset.source as ImageSourcePropType}
      testID={props?.testID}
      style={props?.style}
      resizeMode={props?.resizeMode ?? 'contain'}
    />
  );
};
