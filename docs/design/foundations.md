# Design Foundations

## Theme Model

First Ride의 디자인 값은 `apps/native/theme/design-system.ts`에서 시작한다.

이 파일 안의 색상, 간격, 라운드, 글자 크기가 `tokens.ts`를 통해 앱 테마로 연결된다.

First Ride의 테마 구조는 `ThemeContract`를 기준으로 한다.

- 기본 테마: `light`, `dark`
- 직업 테마: `blue`, `green`, `red`
- 밀도: `compact`, `comfortable`, `spacious`
- 라운드 스타일: `sharp`, `rounded`, `pill`
- 기본 폰트: `Pretendard`

직업 테마 매핑은 `apps/native/theme/job-theme.ts`에서 관리한다.

- 검사, Warrior: `blue`
- 궁수, Archer: `green`
- 마법사, Mage: `red`
- 알 수 없는 직업: `blue`

## Color Roles

색상은 `apps/native/theme/design-system.ts`의 `palette`에서 수정한다.

화면에 적용될 때는 아래 역할로 연결된다.

- `background`: 앱 배경, 카드, 입력창, 오버레이
- `text`: 본문, 보조 텍스트, 링크, 라벨, 입력 텍스트
- `action`: primary, secondary, ghost 버튼 상태
- `feedback`: success, error, warning, info
- `border`: 기본선, 강조선, 약한선, 포커스선, 구분선
- `brand`: 현재 레트로/직업 테마 화면에서 쓰는 브랜드 역할
- `filter`: 상태 필터 UI 역할
- `questDetail`: 퀘스트 상세 전용 역할
- `tag`: 중요도 태그 역할

`palette`는 원재료이고 `theme.colors`는 제품 역할이다. 디자이너는 `palette`를 고치고, 컴포넌트에서는 되도록 `theme.colors`를 참조한다.

## Spacing

간격 토큰은 `apps/native/theme/design-system.ts`의 `spacing`에서 수정한다.

- `1`: 4
- `2`: 8
- `3`: 12
- `4`: 16
- `5`: 20
- `6`: 24
- `8`: 32
- `10`: 40
- `12`: 48
- `16`: 64
- `24`: 96

레이아웃의 여백, `gap`, `padding`, `margin`은 spacing을 우선 사용한다.

## Dimension

고정 크기에는 `baseFoundation.dimension`을 사용한다.

예: 아이콘 컨테이너, 아바타, 탭 높이, 고정 버튼 높이, 장식 요소 크기.

레이아웃 사이의 거리에는 dimension을 쓰지 않는다.

## Radius

기본 라운드는 `apps/native/theme/design-system.ts`의 `radii`에서 수정한다.

현재 값은 아래와 같다.

- `none`: 0
- `xs`: 8
- `s`: 12
- `m`: 16
- `l`: 24
- `xl`: 32
- `round`: 9999

`radiusStyle`이 `sharp`이면 주요 라운드가 0이 되고, `pill`이면 `s`, `m`, `l`이 pill 형태로 바뀐다.

## Typography

타입 크기는 `apps/native/theme/design-system.ts`의 `typography.size`에서 수정한다.

- Caption: `caption3` 11, `caption2` 12, `caption1` 13
- Body: `body3` 14, `body2` 15, `body1` 16
- Subtitle: `subtitle2` 18, `subtitle1` 20
- Title: `title` 22, `h3` 24, `h2` 28, `h1` 32, `h0` 40

폰트 굵기는 `regular`, `medium`, `semibold`, `bold`를 사용한다.

## Motion

모션 시간은 아래 단계로 통일한다.

- `instant`: 100ms
- `fast`: 150ms
- `normal`: 250ms
- `slow`: 400ms
- `slower`: 600ms

짧은 피드백은 `fast`, 화면 전환이나 상태 변화는 `normal`을 기본값으로 둔다.

## Elevation

그림자는 `s`, `m`, `l` 세 단계만 사용한다.

- `s`: 얕은 구분
- `m`: 카드나 떠 있는 패널
- `l`: 모달, 강조 레이어

새 shadow 값을 추가하기 전에 기존 단계로 표현 가능한지 먼저 확인한다.
