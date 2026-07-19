import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDeviceId } from '@/utils/device-id';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockedStorage = jest.mocked(AsyncStorage);

describe('설치 기기 ID 저장소', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('저장된 ID가 있으면 같은 값을 계속 반환한다', async () => {
    mockedStorage.getItem.mockResolvedValue('stored-device-id');

    await expect(getDeviceId()).resolves.toBe('stored-device-id');

    expect(mockedStorage.setItem).not.toHaveBeenCalled();
  });

  it('저장된 ID가 없으면 새 ID를 생성해 저장한다', async () => {
    mockedStorage.getItem.mockResolvedValue(null);

    const deviceId = await getDeviceId();

    expect(deviceId).toMatch(/^installation-/);
    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      'installationDeviceId',
      deviceId,
    );
  });

  it('저장소를 읽을 수 없어도 로그인용 ID를 반환한다', async () => {
    mockedStorage.getItem.mockRejectedValue(new Error('storage unavailable'));

    await expect(getDeviceId()).resolves.toMatch(/^installation-/);
  });

  it('새 ID를 저장할 수 없어도 생성한 ID를 반환한다', async () => {
    mockedStorage.getItem.mockResolvedValue(null);
    mockedStorage.setItem.mockRejectedValue(new Error('storage unavailable'));

    await expect(getDeviceId()).resolves.toMatch(/^installation-/);
  });
});
