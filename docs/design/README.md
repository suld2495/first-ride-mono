# First Ride Design

First Ride의 디자인 문서는 앱 코드에 있는 실제 테마 시스템을 기준으로 관리한다.

## 문서 구성

- [foundations.md](./foundations.md): 색상, 타이포그래피, 간격, 라운드, 그림자, 모션 토큰
- [usage.md](./usage.md): 화면과 컴포넌트에서 토큰을 적용하는 규칙

## 디자이너가 먼저 수정하는 파일

앱 디자인을 바꾸고 싶으면 먼저 이 파일을 수정한다.

- `apps/native/theme/design-system.ts`

이 파일을 커밋하고 푸시하면 앱 코드가 읽는 디자인 토큰도 함께 바뀐다.

## 개발자가 함께 확인하는 파일

디자인 값을 바꿀 때는 문서보다 아래 코드가 우선이다.

- `apps/native/theme/design-system.ts`
- `apps/native/theme/tokens.ts`
- `apps/native/theme/themes/theme.contract.ts`
- `apps/native/theme/themes/light.ts`
- `apps/native/theme/themes/dark.ts`
- `apps/native/theme/themes/blue.ts`
- `apps/native/theme/themes/green.ts`
- `apps/native/theme/themes/red.ts`

## 운영 원칙

- 디자이너는 `apps/native/theme/design-system.ts`를 먼저 수정한다.
- 화면 코드는 하드코딩된 색상값 대신 `theme.colors.*`를 사용한다.
- 여백은 레이아웃 간격이면 `theme.foundation.spacing.*`, 고정 치수면 `theme.foundation.dimension.*`을 사용한다.
- 새 색상이 필요하면 팔레트 값을 바로 쓰기보다 `ThemeContract`에 역할 이름을 추가한다.
- 라이트/다크/직업 테마에서 같은 역할이 모두 정의되어야 한다.
