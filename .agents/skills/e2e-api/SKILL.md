---
name: e2e-api
description: API 요구사항을 반복 실행 가능한 통합/e2e 테스트 코드로 작성할 때 사용한다
---

# API e2e 테스트 코드 작성

요구사항을 체크리스트로 바꾼 뒤, 프로젝트에 실제로 저장되는 API e2e 또는 통합 테스트 파일을 작성한다.

**핵심 원칙:** 실제 요청/응답 계약을 테스트 코드로 고정한다. 기존 서버 테스트 러너와 프로젝트 관례를 우선 재사용한다.

## 언제 사용하는가

- API 명세를 자동화 테스트로 고정할 때
- 성공/에러/경계 케이스를 반복 실행 가능한 코드로 남길 때
- 회귀 방지를 위해 엔드포인트 계약을 테스트 스위트에 추가할 때

## 요청 방법

**1. 프로젝트의 기존 API 테스트 인프라 확인:**
- `supertest`, `MockMvc`, `WebTestClient`, `RestAssured`, 기존 통합 테스트 파일을 먼저 읽는다

**2. e2e 서브에이전트 실행:**

Task 도구를 사용해 `api-test-writer.md` 템플릿을 e2e 서브에이전트에게 전달한다.

**플레이스홀더:**
- `{REQUIREMENTS}` — 테스트 코드로 옮길 요구사항
- `{BASE_URL}` — 서버 접속 기준 URL
- `{AUTH_TOKEN}` — 인증 토큰이 필요한 경우
- `{TEST_INFRA}` — 기존 테스트 러너/디렉터리/관례 정보
- `{DESCRIPTION}` — 무엇을 테스트 코드로 남기는지 간단한 요약

## 예시

```
[회원가입 API 구현 완료]

[e2e-api 서브에이전트 실행]
  REQUIREMENTS: POST /users 는 이메일과 비밀번호를 받아 사용자를 생성한다.
                중복 이메일이면 409를 반환한다.
                잘못된 이메일 형식이면 400을 반환한다.
  BASE_URL: http://localhost:8080
  TEST_INFRA: Java + Spring Boot, src/test/java 통합 테스트 사용 중
  DESCRIPTION: 회원가입 API 계약 테스트 작성

[서브에이전트 결과]:
  파일: src/test/java/.../UserSignupE2ETest.java
  반영: 생성 성공, 중복 409, 형식 오류 400
  실행: ./gradlew test --tests ... 통과
```
