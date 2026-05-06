# Expo 운영 가이드

## 환경변수 관리 위치

Expo 앱에서 사용하는 환경변수는 Expo 대시보드의 EAS Environment Variables에서 관리한다.

- 프로젝트별 환경변수는 Expo 프로젝트 대시보드의 `Project settings > Environment variables`에서 관리한다.
- 계정 공통 환경변수는 Expo 계정 설정의 `Environment variables`에서 관리한다.
- 환경은 `development`, `preview`, `production`으로 나누어 관리한다.

앱 코드에서 사용하는 공개 환경변수는 `EXPO_PUBLIC_` 접두사를 붙인다.

예시:

```env
EXPO_PUBLIC_SUPABASE_URL=<supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=<kakao-native-app-key>
```

`EXPO_PUBLIC_` 값은 앱 번들에 포함되므로 민감한 비밀값을 넣지 않는다.

## 변경 반영 기준

Expo 대시보드에서 환경변수를 변경하면 다음 빌드, 업데이트, 배포 작업부터 반영된다.

- 앱 빌드: `eas build`를 다시 실행한다.
- OTA 업데이트: `eas update --environment <environment>`를 다시 실행한다.
- 웹 배포: `npx expo export --platform web` 후 `eas deploy --environment <environment>`를 다시 실행한다.

로컬 개발에서 Expo 대시보드 값을 사용해야 하면 필요한 환경의 값을 내려받는다.

```bash
eas env:pull --environment development
```

로컬 `.env` 값을 바꾼 뒤 바로 반영되지 않으면 Expo 개발 서버를 재시작한다.

```bash
npx expo start --clear
```
