# 디자인 토큰 수정 가이드

## 먼저 보면 되는 파일

디자인 값을 수정할 때는 아래 파일만 우선 보면 된다.

- `apps/native/theme/tokens.ts`
  - 공통으로 쓰는 기본 값이 들어 있다.
  - 여백, 둥근 정도, 글자 크기, 그림자, 반응형 값 등을 수정할 때 본다.
- `apps/native/theme/themes/light.ts`
  - 라이트 테마 색상을 수정할 때 본다.
- `apps/native/theme/themes/dark.ts`
  - 다크 테마 색상을 수정할 때 본다.

대부분의 경우 이 3개 파일만 수정하면 된다.

## 어떤 값을 어디서 바꾸면 되는지

### 색상 수정

화면의 색상은 주로 아래 두 파일에서 바꾼다.

- `apps/native/theme/themes/light.ts`
- `apps/native/theme/themes/dark.ts`

여기에는 화면에서 쓰는 색이 용도별로 정리되어 있다.

### 배경 색상

아래 항목을 수정하면 배경 계열이 바뀐다.

- `colors.background.base`
  - 앱의 기본 배경
- `colors.background.surface`
  - 카드, 패널, 리스트 아이템 배경
- `colors.background.elevated`
  - 위로 떠 있는 레이어 배경
- `colors.background.sunken`
  - 입력창 안쪽처럼 들어간 느낌의 배경
- `colors.background.overlay`
  - 모달 뒤 어두운 딤 처리

### 글자 색상

- `colors.text.primary`
  - 가장 기본 텍스트
- `colors.text.secondary`
  - 보조 텍스트
- `colors.text.tertiary`
  - 더 약한 보조 텍스트
- `colors.text.disabled`
  - 비활성 텍스트
- `colors.text.inverse`
  - 진한 배경 위 밝은 글자처럼 반전이 필요한 경우
- `colors.text.link`
  - 링크 텍스트

### 버튼 색상

- `colors.action.primary`
  - 기본 버튼
- `colors.action.secondary`
  - 보조 버튼
- `colors.action.ghost`
  - 배경이 거의 없는 버튼

각 버튼 안에는 아래 값이 있다.

- `default`
  - 평상시 색상
- `pressed`
  - 눌렀을 때 색상
- `disabled`
  - 비활성 상태 색상
- `label`
  - 버튼 안의 글자 색상

### 상태 색상

- `colors.feedback.success`
- `colors.feedback.error`
- `colors.feedback.warning`
- `colors.feedback.info`

각 상태 안에는 아래 값이 있다.

- `bg`
  - 배경 색상
- `text`
  - 텍스트 색상
- `border`
  - 테두리 색상

### 선 색상

- `colors.border.default`
  - 기본 테두리
- `colors.border.strong`
  - 더 강조된 테두리
- `colors.border.subtle`
  - 약한 테두리
- `colors.border.focus`
  - 포커스 상태 테두리
- `colors.border.divider`
  - 구분선

### 브랜드 전용 색상

`colors.brand` 안에는 일부 화면에서 따로 쓰는 브랜드/레트로 스타일 색상이 있다.

여기 있는 값은 일반 버튼/텍스트 토큰과 별도로 쓰일 수 있다.

- `primary`
- `text`
- `textSecondary`
- `button`
- `buttonLight`
- `subButton`
- `checkbox`
- `input`
- `error`
- `success`
- `warning`
- `info`
- `border`
- `card`

일반적인 앱 공통 색상 수정은 먼저 `background`, `text`, `action`, `feedback`, `border`를 수정하면 된다.

## 색상 원본 팔레트 수정

여러 곳에서 공통으로 참조하는 기본 색상을 바꾸려면 `apps/native/theme/tokens.ts`의 `palette`를 수정한다.

예를 들면 아래 묶음이 있다.

- `gray`
- `blue`
- `red`
- `green`
- `yellow`
- `stitch`
- `retro`
- `rpg`

보통은 `light.ts`, `dark.ts`에서 실제 화면용 값을 바꾸는 편이 안전하다.

`palette`를 수정하면 여러 곳에 동시에 영향이 갈 수 있다.

## 여백 수정

여백 값은 `apps/native/theme/tokens.ts`의 `baseFoundation.spacing`에서 수정한다.

현재 항목은 아래와 같다.

- `0`
- `px`
- `0.5`
- `1`
- `1.5`
- `2`
- `2.5`
- `3`
- `3.5`
- `4`
- `5`
- `6`
- `7`
- `8`
- `9`
- `10`
- `11`
- `12`
- `14`
- `16`
- `20`
- `24`
- `28`
- `32`
- `36`
- `40`
- `44`
- `48`
- `52`
- `56`
- `60`
- `64`
- `72`
- `80`
- `96`

예시:

- `4: 16`을 `4: 20`으로 바꾸면 `4`를 사용하는 컴포넌트들의 기본 여백이 더 넓어진다.

## 둥근 정도 수정

둥근 정도는 `apps/native/theme/tokens.ts`의 `baseFoundation.radii`에서 수정한다.

현재 항목은 아래와 같다.

- `none`
- `s`
- `m`
- `l`
- `xl`
- `round`

예시:

- 카드와 버튼의 전체적인 둥근 느낌을 줄이려면 `m`, `l`, `xl` 값을 낮춘다.

## 글자 크기와 굵기 수정

타이포 관련 기본 값은 `apps/native/theme/tokens.ts`의 `baseFoundation.typography`에서 수정한다.

### 글자 크기

`baseFoundation.typography.size`

현재 관리 중인 크기 항목:

- `caption3`
- `caption2`
- `caption1`
- `body3`
- `body2`
- `body1`
- `subtitle2`
- `subtitle1`
- `title`
- `h3`
- `h2`
- `h1`
- `h0`
- `xs`
- `s`
- `m`
- `l`
- `xl`
- `xxl`

### 글자 굵기

`baseFoundation.typography.weight`

- `regular`
- `medium`
- `semibold`
- `bold`

### 줄 높이

`baseFoundation.typography.lineHeight`

- `tight`
- `normal`
- `relaxed`

## 그림자 수정

그림자 값은 `apps/native/theme/tokens.ts`의 `baseFoundation.shadow`에서 수정한다.

현재 항목은 아래와 같다.

- `s`
- `m`
- `l`

각 항목 안에는 그림자 색, 위치, 투명도, 번짐, 안드로이드 elevation 값이 들어 있다.

카드나 떠 있는 요소의 느낌을 바꾸고 싶을 때 수정하면 된다.

## 모션 수정

애니메이션 속도와 easing 값은 `apps/native/theme/tokens.ts`의 `baseFoundation.motion`에서 수정한다.

### duration

- `instant`
- `fast`
- `normal`
- `slow`
- `slower`

### easing

- `linear`
- `easeIn`
- `easeOut`
- `easeInOut`

## 레이어 순서 수정

겹치는 요소의 앞뒤 순서는 `apps/native/theme/tokens.ts`의 `baseFoundation.zIndex`에서 수정한다.

현재 항목은 아래와 같다.

- `base`
- `dropdown`
- `sticky`
- `fixed`
- `modalBackdrop`
- `modal`
- `popover`
- `tooltip`
- `toast`

모달이 다른 요소 뒤로 들어가 보일 때 이런 값을 조정한다.

## 아이콘 크기 수정

아이콘 크기는 `apps/native/theme/tokens.ts`의 `baseFoundation.iconSize`에서 수정한다.

- `xs`
- `s`
- `m`
- `l`
- `xl`
- `xxl`

## 반응형 값 수정

기기 크기에 따라 달라지는 값은 `apps/native/theme/tokens.ts`의 `baseFoundation.responsive`에서 수정한다.

현재 항목은 아래와 같다.

- `containerPadding`
- `sectionGap`
- `gridGutter`
- `maxContentWidth`
- `pageTitle`
- `sectionTitle`

예시:

- `containerPadding`을 키우면 좌우 기본 여백이 넓어진다.
- `pageTitle`을 키우면 큰 화면에서 페이지 제목이 더 커진다.

## 다크 모드까지 함께 수정하기

색상을 수정할 때는 아래 순서로 보면 된다.

1. `apps/native/theme/themes/light.ts`에서 라이트 값 수정
2. `apps/native/theme/themes/dark.ts`에서 같은 역할의 다크 값 수정
3. 두 테마 모두에서 대비가 자연스러운지 확인

한쪽만 수정하면 라이트와 다크 화면 분위기가 크게 달라질 수 있다.

## 수정할 때 가장 많이 하는 작업 예시

### 버튼 메인 컬러 바꾸기

수정 파일:

- `apps/native/theme/themes/light.ts`
- `apps/native/theme/themes/dark.ts`

수정 위치:

- `colors.action.primary.default`
- `colors.action.primary.pressed`
- `colors.action.primary.label`

### 입력창이나 카드 배경 톤 바꾸기

수정 위치:

- `colors.background.surface`
- `colors.background.sunken`
- `colors.border.default`

### 전체적으로 더 둥글게 만들기

수정 파일:

- `apps/native/theme/tokens.ts`

수정 위치:

- `baseFoundation.radii.s`
- `baseFoundation.radii.m`
- `baseFoundation.radii.l`
- `baseFoundation.radii.xl`

### 전체적으로 더 촘촘하거나 더 널찍하게 만들기

수정 파일:

- `apps/native/theme/tokens.ts`

수정 위치:

- `baseFoundation.spacing.*`

### 제목 크기 키우기

수정 파일:

- `apps/native/theme/tokens.ts`

수정 위치:

- `baseFoundation.typography.size.title`
- `baseFoundation.typography.size.h3`
- `baseFoundation.typography.size.h2`
- `baseFoundation.typography.size.h1`
- `baseFoundation.typography.size.h0`

## 수정할 때 주의할 점

- `light.ts`, `dark.ts`는 화면에서 직접 쓰는 색상 값이다.
- `tokens.ts`는 여러 화면에 동시에 영향을 주는 공통 기준값이다.
- 작은 값 하나를 바꿔도 버튼, 카드, 모달, 텍스트가 함께 변할 수 있다.
- 색상 수정 시 `default`뿐 아니라 `pressed`, `disabled`, `label`도 함께 보면 결과가 안정적이다.
- 배경색을 바꾸면 텍스트색과 border 색도 같이 확인하는 편이 좋다.

## 빠른 요약

- 색상 수정: `apps/native/theme/themes/light.ts`, `apps/native/theme/themes/dark.ts`
- 공통 크기/여백/둥근 정도 수정: `apps/native/theme/tokens.ts`
- 기본 색상 팔레트 수정: `apps/native/theme/tokens.ts`의 `palette`
