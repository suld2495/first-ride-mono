# 디자인 시스템 안내

## 문서 목차

- 개발 환경 및 테스트 구동: `docs/develop/first-clone-test-run-guide.md`
- 디자인 시스템 가이드: `docs/design/design-system.md`

- 디자인 토큰 수정 가이드는 `docs/design/design-system.md`를 기준으로 본다.
- 색상 수정은 `apps/native/theme/themes/light.ts`, `apps/native/theme/themes/dark.ts`에서 한다.
- 공통 여백, radius, typography, shadow, motion, zIndex, iconSize, responsive 값 수정은 `apps/native/theme/tokens.ts`에서 한다.
- `docs/design/design-system.md`에는 어떤 값을 어디서 바꾸는지와 수정 시 영향 범위가 정리되어 있다.

## 배포 명령어

- iOS production build: `eas build --platform ios --profile production`
- iOS production submit: `eas submit --platform ios --latest --profile production`
- 한번에 : `eas build --platform ios --profile production --auto-submit`
