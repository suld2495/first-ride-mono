import {
  Alert,
  AppState,
  type AppStateStatus,
  Linking,
  Platform,
} from 'react-native';
import RNExitApp from 'react-native-exit-app';

import { render, waitFor } from '@/__tests__/setup/test-utils';
import {
  TESTFLIGHT_UPDATE_URL,
  fetchRequiredAppVersion,
} from '@/api/app-version.api';
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

jest.mock('@/api/app-version.api', () => ({
  TESTFLIGHT_UPDATE_URL: 'https://testflight.apple.com/join/qasZjjWJ',
  fetchRequiredAppVersion: jest.fn(),
}));

const mockedFetchRequiredAppVersion = jest.mocked(fetchRequiredAppVersion);
const mockedExitApp = jest.mocked(RNExitApp.exitApp);

describe('ForceUpdateController', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');
  const openUrlSpy = jest.spyOn(Linking, 'openURL');
  const consoleErrorSpy = jest.spyOn(console, 'error');

  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    mockedFetchRequiredAppVersion.mockReset();
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
    mockedFetchRequiredAppVersion.mockResolvedValue({
      minimumVersion: '1.1.0',
      updateUrl: TESTFLIGHT_UPDATE_URL,
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
    mockedFetchRequiredAppVersion.mockResolvedValue({
      minimumVersion: '1.1.0',
      updateUrl: TESTFLIGHT_UPDATE_URL,
    });

    render(<ForceUpdateController />);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1));
    const buttons = alertSpy.mock.calls[0]?.[2] ?? [];
    const updateButton = buttons.find(
      (button) => button.text === '업데이트 하러가기',
    );

    updateButton?.onPress?.();

    expect(openUrlSpy).toHaveBeenCalledWith(TESTFLIGHT_UPDATE_URL);
  });

  it('exits the app from the cancel button', async () => {
    mockedFetchRequiredAppVersion.mockResolvedValue({
      minimumVersion: '1.1.0',
      updateUrl: TESTFLIGHT_UPDATE_URL,
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
      mockedFetchRequiredAppVersion.mockResolvedValue({
        minimumVersion: latestVersion,
        updateUrl: TESTFLIGHT_UPDATE_URL,
      });

      render(<ForceUpdateController installedVersion={currentVersion} />);

      await waitFor(() =>
        expect(mockedFetchRequiredAppVersion).toHaveBeenCalledTimes(1),
      );
      expect(alertSpy).not.toHaveBeenCalled();
    },
  );

  it('fails open when the store lookup is unavailable', async () => {
    mockedFetchRequiredAppVersion.mockRejectedValue(
      new Error('network unavailable'),
    );

    render(<ForceUpdateController />);

    await waitFor(() =>
      expect(mockedFetchRequiredAppVersion).toHaveBeenCalledTimes(1),
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

    mockedFetchRequiredAppVersion.mockResolvedValue({
      minimumVersion: '1.1.0',
      updateUrl: TESTFLIGHT_UPDATE_URL,
    });

    render(<ForceUpdateController />);
    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1));

    appStateHandler?.('active');

    await waitFor(() =>
      expect(mockedFetchRequiredAppVersion).toHaveBeenCalledTimes(2),
    );

    appStateSpy.mockRestore();
  });

  it('skips App Store lookup on Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    render(<ForceUpdateController />);

    await waitFor(() =>
      expect(mockedFetchRequiredAppVersion).not.toHaveBeenCalled(),
    );
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
