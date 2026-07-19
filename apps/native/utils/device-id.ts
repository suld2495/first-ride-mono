import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'installationDeviceId';
let fallbackDeviceId: string | null = null;

const createDeviceId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = `${Math.random().toString(36).slice(2)}${Math.random()
    .toString(36)
    .slice(2)}`;

  return `installation-${timestamp}-${random}`;
};

export const getDeviceId = async (): Promise<string> => {
  let storedDeviceId: string | null;

  try {
    storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch {
    fallbackDeviceId ??= createDeviceId();

    return fallbackDeviceId;
  }

  if (storedDeviceId) {
    return storedDeviceId;
  }

  const deviceId = createDeviceId();

  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch {
    fallbackDeviceId = deviceId;
  }

  return deviceId;
};
