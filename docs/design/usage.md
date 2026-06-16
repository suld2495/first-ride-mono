# Design Usage

## Token Priority

컴포넌트에서 디자인 값을 고를 때 우선순위는 아래 순서다.

1. `theme.colors.*`
2. `theme.foundation.*`
3. 공통 UI 컴포넌트의 기본 스타일
4. 새 역할 토큰 추가

색상 문자열을 직접 넣는 것은 임시 디버깅 외에는 피한다.

## Designer Workflow

디자이너가 앱 디자인을 바꾸는 기본 흐름은 아래와 같다.

1. `apps/native/theme/design-system.ts`를 연다.
2. 색상은 `palette`, 간격은 `spacing`, 둥근 정도는 `radii`, 글자는 `typography`를 수정한다.
3. 변경사항을 커밋하고 푸시한다.
4. 앱 빌드나 배포가 다시 돌면 수정된 디자인 값이 반영된다.

`docs/design`은 설명서이고, 실제 앱이 읽는 값은 `apps/native/theme/design-system.ts`다.

## Adding A Color Role

새 색상이 필요할 때는 아래 순서로 추가한다.

1. `apps/native/theme/themes/theme.contract.ts`에 의미가 드러나는 역할을 추가한다.
2. `light.ts`, `dark.ts`, `blue.ts`, `green.ts`, `red.ts`에 같은 역할을 채운다.
3. 컴포넌트에서는 새 역할만 참조한다.
4. 기존 역할로 대체 가능한 값이면 새 역할을 만들지 않는다.

좋은 역할 이름:

- `colors.feedback.warning.text`
- `colors.border.focus`
- `colors.background.input`

피해야 할 역할 이름:

- `colors.yellow`
- `colors.buttonBlue`
- `colors.temp`

## Layout Values

간격과 크기는 의미를 분리한다.

- 요소 사이 거리: `spacing`
- 화면 안쪽 여백: `spacing`
- 고정 높이와 너비: `dimension`
- 아이콘 크기: `iconSize`
- 반응형 페이지 여백: `responsive`

예를 들어 리스트 아이템 사이 간격 16은 `spacing[4]`이고, 16x16 아이콘은 `iconSize.s` 또는 `dimension.x16`이다.

## Component Rules

- 텍스트 색은 `theme.colors.text.*`에서 고른다.
- 버튼 색은 `theme.colors.action.*`에서 고른다.
- 상태 배지는 `theme.colors.feedback.*`를 사용한다.
- 카드와 패널은 `background.surface` 또는 `background.elevated`를 우선 사용한다.
- 입력 필드는 `background.input`, `border.input`, `text.input`을 함께 확인한다.
- 포커스 상태는 `border.focus`를 사용한다.

## Job Theme Rules

직업 테마는 캐릭터 성격을 반영하는 화면에만 적용한다.

- 기본 앱 구조와 시스템 화면: `light` 또는 `dark`
- 직업별 홈, 캐릭터, 루틴 표현: `blue`, `green`, `red`
- 직업을 알 수 없는 사용자: `blue`

직업 테마 안에서도 버튼, 텍스트, 배경은 역할 토큰으로 접근한다.

## Review Checklist

디자인 관련 PR은 아래를 확인한다.

- 하드코딩 색상값이 새로 들어가지 않았는가
- 라이트/다크/직업 테마에서 새 역할이 모두 정의되었는가
- spacing과 dimension을 용도에 맞게 구분했는가
- 같은 화면 안에서 라운드와 그림자 단계가 과하게 늘어나지 않았는가
- 새 토큰을 추가했다면 이 문서도 함께 갱신했는가
