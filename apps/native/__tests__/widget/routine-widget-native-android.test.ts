import type {
  CharacterWidgetSnapshot,
  RoutineWidgetSnapshot,
} from '@/widget/routine-widget';

const mockExtensionSet = jest.fn();
const mockExtensionRemove = jest.fn();
const mockReloadWidget = jest.fn();

jest.mock('@bacons/apple-targets', () => {
  class ExtensionStorage {
    static reloadWidget = mockReloadWidget;

    set = mockExtensionSet;
    remove = mockExtensionRemove;
  }

  return { ExtensionStorage };
});

const routineSnapshot: RoutineWidgetSnapshot = {
  status: 'signedOut',
  title: '이번 주 루틴',
  message: '로그인 해주세요',
  items: [],
  remainingCount: 0,
};
const characterSnapshot: CharacterWidgetSnapshot = {
  status: 'ready',
  level: 4,
  currentExp: 6,
  expForNextLevel: 10,
  characterImageUrl: 'https://example.com/character.png',
  backgroundImageUrl: 'https://example.com/background.png',
  generatedAt: '2026-08-10T00:00:00.000Z',
  levelBadgeStyle: {
    backgroundColor: '#D2EBFF',
    textColor: '#145A92',
  },
  experienceStyle: {
    primaryColor: '#107AD6',
    trackColor: '#A3D4FF',
    textColor: '#2C5171',
  },
};

describe('Android routine widget native bridge', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('forwards routine and character snapshots to the native module', async () => {
    const saveSnapshot = jest.fn().mockResolvedValue(undefined);
    const saveCharacterSnapshot = jest.fn().mockResolvedValue(undefined);

    jest.resetModules();
    jest.unmock('@/widget/routine-widget-native');
    jest.doMock('react-native', () => ({
      NativeModules: {
        RoutineWidget: {
          saveSnapshot,
          saveCharacterSnapshot,
          clearSnapshot: jest.fn(),
        },
      },
      Platform: { OS: 'android' },
    }));

    const nativeBridge =
      require('@/widget/routine-widget-native') as typeof import('@/widget/routine-widget-native');

    await nativeBridge.saveRoutineWidgetSnapshot(routineSnapshot);
    await nativeBridge.saveCharacterWidgetSnapshot(characterSnapshot);

    expect(saveSnapshot).toHaveBeenCalledWith(JSON.stringify(routineSnapshot));
    expect(saveCharacterSnapshot).toHaveBeenCalledWith(
      JSON.stringify(characterSnapshot),
    );
  });

  it('clears both Android widgets through the native module', async () => {
    const clearSnapshot = jest.fn().mockResolvedValue(undefined);

    jest.resetModules();
    jest.unmock('@/widget/routine-widget-native');
    jest.doMock('react-native', () => ({
      NativeModules: {
        RoutineWidget: {
          saveSnapshot: jest.fn(),
          saveCharacterSnapshot: jest.fn(),
          clearSnapshot,
        },
      },
      Platform: { OS: 'android' },
    }));

    const nativeBridge =
      require('@/widget/routine-widget-native') as typeof import('@/widget/routine-widget-native');

    await nativeBridge.clearRoutineWidgetSnapshot();

    expect(clearSnapshot).toHaveBeenCalledTimes(1);
  });

  it('does not fail on Android when the native module is unavailable', async () => {
    jest.resetModules();
    jest.unmock('@/widget/routine-widget-native');
    jest.doMock('react-native', () => ({
      NativeModules: {},
      Platform: { OS: 'android' },
    }));

    const nativeBridge =
      require('@/widget/routine-widget-native') as typeof import('@/widget/routine-widget-native');

    await expect(
      nativeBridge.saveRoutineWidgetSnapshot(routineSnapshot),
    ).resolves.toBeUndefined();
    await expect(
      nativeBridge.saveCharacterWidgetSnapshot(characterSnapshot),
    ).resolves.toBeUndefined();
    await expect(
      nativeBridge.clearRoutineWidgetSnapshot(),
    ).resolves.toBeUndefined();
  });

  it('keeps the existing iOS extension storage behavior', async () => {
    jest.resetModules();
    jest.unmock('@/widget/routine-widget-native');
    jest.doMock('react-native', () => ({
      NativeModules: {},
      Platform: { OS: 'ios' },
    }));

    const nativeBridge =
      require('@/widget/routine-widget-native') as typeof import('@/widget/routine-widget-native');

    await nativeBridge.saveRoutineWidgetSnapshot(routineSnapshot);
    await nativeBridge.saveCharacterWidgetSnapshot(characterSnapshot);
    await nativeBridge.clearRoutineWidgetSnapshot();

    expect(mockExtensionSet).toHaveBeenCalledWith(
      'snapshot',
      JSON.stringify(routineSnapshot),
    );
    expect(mockExtensionSet).toHaveBeenCalledWith(
      'characterSnapshot',
      JSON.stringify(characterSnapshot),
    );
    expect(mockExtensionRemove).toHaveBeenCalledWith('snapshot');
    expect(mockExtensionRemove).toHaveBeenCalledWith('characterSnapshot');
    expect(mockReloadWidget).toHaveBeenCalledWith('RoutineWidget');
    expect(mockReloadWidget).toHaveBeenCalledWith('CharacterStatusWidget');
  });
});
