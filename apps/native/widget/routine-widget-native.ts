import { ExtensionStorage } from '@bacons/apple-targets';
import { NativeModules } from 'react-native';

import type {
  CharacterWidgetSnapshot,
  RoutineWidgetSnapshot,
} from './routine-widget';

const APP_GROUP_IDENTIFIER = 'group.com.mannal.firstride';
const SNAPSHOT_KEY = 'snapshot';
const IOS_WIDGET_KIND = 'RoutineWidget';
const CHARACTER_SNAPSHOT_KEY = 'characterSnapshot';
const IOS_CHARACTER_WIDGET_KIND = 'CharacterStatusWidget';

interface RoutineWidgetNativeModule {
  saveSnapshot: (snapshotJson: string) => Promise<void>;
  clearSnapshot: () => Promise<void>;
}

const nativeModule = NativeModules.RoutineWidget as
  | RoutineWidgetNativeModule
  | undefined;

export const saveRoutineWidgetSnapshot = async (
  snapshot: RoutineWidgetSnapshot,
): Promise<void> => {
  if (process.env.EXPO_OS === 'ios') {
    const storage = new ExtensionStorage(APP_GROUP_IDENTIFIER);

    storage.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
    ExtensionStorage.reloadWidget(IOS_WIDGET_KIND);
    return;
  }

  if (!nativeModule) {
    return;
  }

  await nativeModule.saveSnapshot(JSON.stringify(snapshot));
};

export const saveCharacterWidgetSnapshot = async (
  snapshot: CharacterWidgetSnapshot,
): Promise<void> => {
  if (process.env.EXPO_OS !== 'ios') {
    return;
  }

  const storage = new ExtensionStorage(APP_GROUP_IDENTIFIER);

  storage.set(CHARACTER_SNAPSHOT_KEY, JSON.stringify(snapshot));
  ExtensionStorage.reloadWidget(IOS_CHARACTER_WIDGET_KIND);
};

export const clearRoutineWidgetSnapshot = async (): Promise<void> => {
  if (process.env.EXPO_OS === 'ios') {
    const storage = new ExtensionStorage(APP_GROUP_IDENTIFIER);

    storage.remove(SNAPSHOT_KEY);
    storage.remove(CHARACTER_SNAPSHOT_KEY);
    ExtensionStorage.reloadWidget(IOS_WIDGET_KIND);
    ExtensionStorage.reloadWidget(IOS_CHARACTER_WIDGET_KIND);
    return;
  }

  if (!nativeModule) {
    return;
  }

  await nativeModule.clearSnapshot();
};
