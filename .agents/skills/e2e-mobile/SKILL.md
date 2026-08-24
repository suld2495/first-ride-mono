---
name: e2e-mobile
description: React Native 모바일 요구사항을 반복 실행 가능한 Maestro 또는 기존 모바일 e2e 테스트 코드로 작성할 때 사용한다
---

# 모바일 e2e 테스트 코드 작성

요구사항을 체크리스트로 바꾼 뒤, 프로젝트에 실제로 저장되는 모바일 e2e 테스트 파일을 작성한다.

**핵심 원칙:** 일회성 검증 flow가 아니라 재실행 가능한 모바일 e2e 테스트 자산을 남긴다. 기존 Detox/Maestro 관례가 있으면 그것을 우선 따른다.

## 언제 사용하는가

- React Native 화면 흐름을 e2e 테스트 코드로 남길 때
- 수동 Maestro 검증을 정식 테스트 스위트로 전환할 때
- 핵심 사용자 여정을 회귀 테스트로 고정할 때

## 요청 방법

**1. 프로젝트의 기존 모바일 테스트 인프라 확인:**
- `maestro/`, `.maestro/`, `detox.config.*`, 기존 flow/test 파일을 먼저 읽는다

**2. e2e 서브에이전트 실행:**

Task 도구를 사용해 `mobile-test-writer.md` 템플릿을 e2e 서브에이전트에게 전달한다.

**플레이스홀더:**
- `{REQUIREMENTS}` — 테스트 코드로 옮길 요구사항
- `{APP_PACKAGE}` — 앱 패키지명
- `{TEST_INFRA}` — 기존 테스트 러너/디렉터리/관례 정보
- `{DESCRIPTION}` — 무엇을 테스트 코드로 남기는지 간단한 요약

## 예시

```
[로그인 화면 구현 완료]

[e2e-mobile 서브에이전트 실행]
  REQUIREMENTS: 사용자는 이메일과 비밀번호로 로그인할 수 있다.
                로그인 성공 시 홈 화면으로 이동한다.
                실패 시 오류 문구가 표시된다.
  APP_PACKAGE: com.myapp.android
  TEST_INFRA: .maestro/flows 사용 중
  DESCRIPTION: 로그인 화면 e2e flow 작성

[서브에이전트 결과]:
  파일: .maestro/login/login-success.yaml, .maestro/login/login-failure.yaml
  반영: 성공 이동, 실패 오류 문구
  실행: maestro test .maestro/login/login-success.yaml 통과
```
