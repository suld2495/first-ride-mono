import * as Application from 'expo-application';
import * as Device from 'expo-device';

import { useAuthUser } from '@/hooks/useAuthSession';
import { useForceUpdate } from '@/hooks/useForceUpdate';

interface ForceUpdateControllerProps {
  installedBuildNumber?: string | null;
  isPhysicalDevice?: boolean;
}

export default function ForceUpdateController({
  installedBuildNumber = Application.nativeBuildVersion,
  isPhysicalDevice = Device.isDevice,
}: ForceUpdateControllerProps) {
  const user = useAuthUser();

  useForceUpdate(installedBuildNumber, user?.userId, isPhysicalDevice);

  return null;
}
