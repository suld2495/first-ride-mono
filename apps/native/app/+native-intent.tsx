/**
 * 네이티브 딥링크 필터링
 *
 * Expo Router가 모든 딥링크를 라우트로 처리하려고 하는데,
 * 카카오 SDK의 OAuth 콜백 딥링크(kakao{APP_KEY}://oauth)는
 * SDK가 내부적으로 처리해야 합니다.
 *
 * 이 파일은 특정 딥링크를 Expo Router에서 무시하도록 합니다.
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  // 카카오 OAuth 콜백은 무시 (SDK가 처리)
  if (path.includes('oauth')) {
    return null;
  }

  // 다른 딥링크는 정상 처리
  return path;
}
