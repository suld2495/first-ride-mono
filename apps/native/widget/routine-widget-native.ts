import { ExtensionStorage } from '@bacons/apple-targets';
import { NativeModules } from 'react-native';

import type { RoutineWidgetSnapshot } from './routine-widget';

const APP_GROUP_IDENTIFIER = 'group.com.mannal.firstride';
const SNAPSHOT_KEY = 'snapshot';
const IOS_WIDGET_KIND = 'RoutineWidget';

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

export const clearRoutineWidgetSnapshot = async (): Promise<void> => {
  if (process.env.EXPO_OS === 'ios') {
    const storage = new ExtensionStorage(APP_GROUP_IDENTIFIER);

    storage.remove(SNAPSHOT_KEY);
    ExtensionStorage.reloadWidget(IOS_WIDGET_KIND);
    return;
  }

  if (!nativeModule) {
    return;
  }

  await nativeModule.clearSnapshot();
};
