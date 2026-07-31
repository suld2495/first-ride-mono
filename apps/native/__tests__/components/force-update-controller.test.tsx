import {
  Alert,
  AppState,
  type AppStateStatus,
  Linking,
  Platform,
} from 'react-native';
import RNExitApp from 'react-native-exit-app';

import { render, waitFor } from '@/__tests__/setup/test-utils';
import { fetchLatestAppStoreVersion } from '@/api/app-store-version.api';
import ForceUpdateController from '@/components/force-update-controller';

jest.mock('expo-application', () => ({
  __esModule: true,
  nativeApplicationVersion: '1.0.0',
}));

jest.mock(
  'react-native-exit-app',
  () => ({
    __esModule: true,
    default: {
      exitApp: jest.fn(),
    },
  }),
  { virtual: true },
);

jest.mock('@/api/app-store-version.api', () => ({
  fetchLatestAppStoreVersion: jest.fn(),
}));

const mockedFetchLatestAppStoreVersion = jest.mocked(
  fetchLatestAppStoreVersion,
);
const mockedExitApp = jest.mocked(RNExitApp.exitApp);

describe('ForceUpdateController', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');
  const openUrlSpy = jest.spyOn(Linking, 'openURL');
  const consoleErrorSpy = jest.spyOn(console, 'error');

  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    mockedFetchLatestAppStoreVersion.mockReset();
    mockedExitApp.mockReset();
    alertSpy.mockReset();
    openUrlSpy.mockReset();
    openUrlSpy.mockResolvedValue(undefined);
    consoleErrorSpy.mockReset();
  });

  afterAll(() => {
    alertSpy.mockRestore();
    openUrlSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('shows a required update confirm when the installed version is lower', async () => {
    mockedFetchLatestAppStoreVersion.mockResolvedValue({
      version: '1.1.0',
      storeUrl: 'https://apps.apple.com/kr/app/id6747031303',
    });

    render(<ForceUpdateController />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        '업데이트가 필요해요',
        expect.stringContaining('최신 버전(1.1.0)'),
        expect.any(Array),
        { cancelable: false },
      );
    });
  });

  it('opens the App Store from the update button', async () => {
    const storeUrl = 'https://apps.apple.com/kr/app/id6747031303';

    mockedFetchLatestAppStoreVersion.mockResolvedValue({
      version: '1.1.0',
      storeUrl,
    });

    render(<ForceUpdateController />);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1));
    const buttons = alertSpy.mock.calls[0]?.[2] ?? [];
    const updateButton = buttons.find(
      (button) => button.text === '업데이트 하러가기',
    );

    updateButton?.onPress?.();

    expect(openUrlSpy).toHaveBeenCalledWith(storeUrl);
  });

  it('exits the app from the cancel button', async () => {
    mockedFetchLatestAppStoreVersion.mockResolvedValue({
      version: '1.1.0',
      storeUrl: 'https://apps.apple.com/kr/app/id6747031303',
    });

    render(<ForceUpdateController />);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1));
    const buttons = alertSpy.mock.calls[0]?.[2] ?? [];
    const cancelButton = buttons.find((button) => button.text === '취소');

    cancelButton?.onPress?.();

    expect(mockedExitApp).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['the installed version is current', '1.1.0', '1.1.0'],
    ['the installed version is newer', '1.2.0', '1.1.0'],
  ])(
    'does not interrupt the user when %s',
    async (_caseName, currentVersion, latestVersion) => {
      mockedFetchLatestAppStoreVersion.mockResolvedValue({
        version: latestVersion,
        storeUrl: 'https://apps.apple.com/kr/app/id6747031303',
      });

      render(<ForceUpdateController installedVersion={currentVersion} />);

      await waitFor(() =>
        expect(mockedFetchLatestAppStoreVersion).toHaveBeenCalledTimes(1),
      );
      expect(alertSpy).not.toHaveBeenCalled();
    },
  );

  it('fails open when the store lookup is unavailable', async () => {
    mockedFetchLatestAppStoreVersion.mockRejectedValue(
      new Error('network unavailable'),
    );

    render(<ForceUpdateController />);

    await waitFor(() =>
      expect(mockedFetchLatestAppStoreVersion).toHaveBeenCalledTimes(1),
    );
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('checks again after returning to the foreground', async () => {
    let appStateHandler: ((state: AppStateStatus) => void) | undefined;
    const appStateSpy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

    mockedFetchLatestAppStoreVersion.mockResolvedValue({
      version: '1.1.0',
      storeUrl: 'https://apps.apple.com/kr/app/id6747031303',
    });

    render(<ForceUpdateController />);
    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1));

    appStateHandler?.('active');

    await waitFor(() =>
      expect(mockedFetchLatestAppStoreVersion).toHaveBeenCalledTimes(2),
    );

    appStateSpy.mockRestore();
  });

  it('skips App Store lookup on Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    render(<ForceUpdateController />);

    await waitFor(() =>
      expect(mockedFetchLatestAppStoreVersion).not.toHaveBeenCalled(),
    );
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
