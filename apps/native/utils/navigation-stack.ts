export type NavigationParam = string | string[] | undefined;

export interface NavigationLocation {
  pathname: string;
  searchParams?: Record<string, NavigationParam>;
}

export type NavigationAction = 'push' | 'replace';

const RELATIVE_URL_BASE = 'https://first-ride.local';
const NUMERIC_PATH_SEGMENT_PATTERN = /^\d+$/;

const getFirstParamValue = (value: NavigationParam): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/**
 * 라우트 경로에서 동적 숫자 세그먼트를 제거해 페이지 유형을 만든다.
 * 예: /verification-requests/1 -> /verification-requests/:id
 */
const normalizePathname = (pathname: string): string => {
  const pathnameWithoutQuery = pathname.split('?')[0] || '/';
  const segments = pathnameWithoutQuery.split('/').filter(Boolean);

  if (!segments.length) {
    return '/';
  }

  return `/${segments
    .map((segment) =>
      NUMERIC_PATH_SEGMENT_PATTERN.test(segment) ? ':id' : segment,
    )
    .join('/')}`;
};

const getPageKey = ({ pathname, searchParams = {} }: NavigationLocation) => {
  const normalizedPathname = normalizePathname(pathname);

  // /modal은 type이 실제 화면을 결정하므로 type까지 페이지 유형에 포함한다.
  if (normalizedPathname === '/modal') {
    const modalType = getFirstParamValue(searchParams.type);
    return `${normalizedPathname}?type=${modalType ?? ''}`;
  }

  return normalizedPathname;
};

const parsePath = (path: string): NavigationLocation => {
  const url = new URL(path, RELATIVE_URL_BASE);
  const searchParams: Record<string, string> = {};

  for (const [key, value] of url.searchParams) {
    searchParams[key] = value;
  }

  return {
    pathname: url.pathname,
    searchParams,
  };
};

/**
 * 현재 화면과 이동 대상이 같은 페이지 유형인지 판단해 이동 방식을 반환한다.
 * 동적 파라미터는 페이지 유형에 포함하지 않는다.
 */
export const getNavigationAction = (
  current: NavigationLocation,
  targetPath: string,
): NavigationAction =>
  getPageKey(current) === getPageKey(parsePath(targetPath))
    ? 'replace'
    : 'push';
