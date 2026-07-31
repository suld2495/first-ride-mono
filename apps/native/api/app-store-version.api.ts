import { fetch as expoFetch } from 'expo/fetch';

export const APP_STORE_ID = '6747031303';

const APP_STORE_COUNTRY = 'kr';
const APP_STORE_LOOKUP_TIMEOUT_MS = 10_000;
const APP_STORE_LOOKUP_URL =
  `https://itunes.apple.com/lookup?id=${APP_STORE_ID}` +
  `&country=${APP_STORE_COUNTRY}`;

interface StoreFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

type StoreFetcher = (
  url: string,
  init?: {
    headers?: Record<string, string>;
    signal?: AbortSignal;
  },
) => Promise<StoreFetchResponse>;

interface AppStoreLookupResult {
  version: string;
  trackViewUrl: string;
}

interface AppStoreLookupResponse {
  resultCount: number;
  results: AppStoreLookupResult[];
}

export interface AppStoreVersion {
  version: string;
  storeUrl: string;
}

const isLookupResponse = (value: unknown): value is AppStoreLookupResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AppStoreLookupResponse>;

  return (
    typeof candidate.resultCount === 'number' &&
    Array.isArray(candidate.results)
  );
};

const isLookupResult = (value: unknown): value is AppStoreLookupResult => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AppStoreLookupResult>;

  return (
    typeof candidate.version === 'string' &&
    candidate.version.length > 0 &&
    typeof candidate.trackViewUrl === 'string' &&
    candidate.trackViewUrl.startsWith('https://')
  );
};

export const fetchLatestAppStoreVersion = async (
  fetcher: StoreFetcher = expoFetch,
): Promise<AppStoreVersion | null> => {
  const abortController = new AbortController();
  const timeout = setTimeout(
    () => abortController.abort(),
    APP_STORE_LOOKUP_TIMEOUT_MS,
  );

  try {
    const response = await fetcher(APP_STORE_LOOKUP_URL, {
      headers: { Accept: 'application/json' },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`App Store lookup failed with HTTP ${response.status}`);
    }

    const body = await response.json();

    if (!isLookupResponse(body)) {
      throw new Error('App Store lookup returned invalid metadata');
    }

    if (body.resultCount === 0) {
      return null;
    }

    const result = body.results[0];

    if (!isLookupResult(result)) {
      throw new Error('App Store lookup returned invalid metadata');
    }

    return {
      version: result.version,
      storeUrl: result.trackViewUrl,
    };
  } finally {
    clearTimeout(timeout);
  }
};
