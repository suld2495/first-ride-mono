# 디자인 시스템 안내

## 작업 방식

- 사용자가 별도로 요청하지 않는 한 새 테스트 코드를 작성하거나 기존 테스트 코드를 수정하지 않는다.

## 문서 목차

- 개발 환경 및 테스트 구동: `docs/develop/first-clone-test-run-guide.md`
- 네비게이션 스택 규칙: `docs/develop/navigation-stack-rules.md`
- 디자인 시스템 가이드: `docs/design/design-system.md`

- 디자인 토큰 수정 가이드는 `docs/design/design-system.md`를 기준으로 본다.
- 색상 수정은 `apps/native/theme/themes/light.ts`, `apps/native/theme/themes/dark.ts`에서 한다.
- 공통 여백, radius, typography, shadow, motion, zIndex, iconSize, responsive 값 수정은 `apps/native/theme/tokens.ts`에서 한다.
- `docs/design/design-system.md`에는 어떤 값을 어디서 바꾸는지와 수정 시 영향 범위가 정리되어 있다.

## 배포 명령어

---

### IOS

- iOS production build: `cd apps/native && eas build --platform ios --profile production`
- iOS production submit: `cd apps/native && eas submit --platform ios --latest --profile production`
- 한번에 : `cd apps/native && eas build --platform ios --profile production --auto-submit`

### 라이브러리 설치 되었다면 아래 실행해보자

```
cd apps/native
npx expo prebuild --clean --platform ios --no-install
cd ios && pod install
```

---

### 안드로이드

cd apps/native && eas build --platform android --profile production
cd apps/native && eas build --platform android --profile production --auto-submit
