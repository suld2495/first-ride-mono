import * as Application from 'expo-application';

import { useForceUpdate } from '@/hooks/useForceUpdate';

interface ForceUpdateControllerProps {
  installedVersion?: string | null;
}

export default function ForceUpdateController({
  installedVersion = Application.nativeApplicationVersion,
}: ForceUpdateControllerProps) {
  useForceUpdate(installedVersion);

  return null;
}
