import type * as ClaritySdkModule from '@microsoft/react-native-clarity';
import { Platform } from 'react-native';

import { getClarityProjectId } from '@/utils/env';

type ClaritySdk = typeof ClaritySdkModule;

interface InitializeClarityOptions {
  isDevelopment?: boolean;
  loadSdk?: () => ClaritySdk;
  platform?: string;
  projectId?: string | null;
}

const SUPPORTED_PLATFORMS = new Set(['android', 'ios']);

const loadClaritySdk = (): ClaritySdk =>
  require('@microsoft/react-native-clarity') as ClaritySdk;

let isClarityInitialized = false;

export function initializeClarity({
  isDevelopment = process.env.NODE_ENV !== 'production',
  loadSdk = loadClaritySdk,
  platform = Platform.OS,
  projectId = getClarityProjectId(),
}: InitializeClarityOptions = {}): boolean {
  const normalizedProjectId = projectId?.trim();

  if (
    isClarityInitialized ||
    !normalizedProjectId ||
    !SUPPORTED_PLATFORMS.has(platform)
  ) {
    return false;
  }

  const claritySdk = loadSdk();

  claritySdk.initialize(normalizedProjectId, {
    logLevel: isDevelopment
      ? claritySdk.LogLevel.Verbose
      : claritySdk.LogLevel.None,
  });
  isClarityInitialized = true;

  return true;
}
