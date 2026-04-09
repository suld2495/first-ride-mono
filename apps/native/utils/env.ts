export function getKakaoNativeAppKey(): string | null {
  return (
    process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ||
    process.env.KAKAO_NATIVE_APP_KEY ||
    null
  );
}
