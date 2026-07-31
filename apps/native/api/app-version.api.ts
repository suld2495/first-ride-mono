import { fetch as expoFetch } from 'expo/fetch';

export const TESTFLIGHT_UPDATE_URL =
  'https://testflight.apple.com/join/qasZjjWJ';
export const VERSION_CONFIG_URL =
  'https://raw.githubusercontent.com/suld2495/first-ride-mono/main/apps/native/config/app-version.json';

const VERSION_CONFIG_TIMEOUT_MS = 10_000;
const VERSION_PATTERN = /^\d+(?:\.\d+)*$/;

interface VersionConfigFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

type VersionConfigFetcher = (
  url: string,
  init?: {
    headers?: Record<string, string>;
    signal?: AbortSignal;
  },
) => Promise<VersionConfigFetchResponse>;

export interface RequiredAppVersion {
  minimumVersion: string;
  updateUrl: string;
}

const isRequiredAppVersion = (value: unknown): value is RequiredAppVersion => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RequiredAppVersion>;

  return (
    typeof candidate.minimumVersion === 'string' &&
    VERSION_PATTERN.test(candidate.minimumVersion) &&
    candidate.updateUrl === TESTFLIGHT_UPDATE_URL
  );
};

export const fetchRequiredAppVersion = async (
  fetcher: VersionConfigFetcher = expoFetch,
): Promise<RequiredAppVersion> => {
  const abortController = new AbortController();
  const timeout = setTimeout(
    () => abortController.abort(),
    VERSION_CONFIG_TIMEOUT_MS,
  );

  try {
    const response = await fetcher(VERSION_CONFIG_URL, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`App version config failed with HTTP ${response.status}`);
    }

    const body = await response.json();

    if (!isRequiredAppVersion(body)) {
      throw new Error('App version config returned invalid metadata');
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
};
