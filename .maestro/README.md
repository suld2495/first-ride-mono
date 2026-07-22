# 출시 전 개인정보 E2E

회원 탈퇴 안전 취소와 분석 데이터 수집 설정을 실제 앱 UI에서 반복 검증하는
Maestro 흐름이다.

## 실행 전제

- iOS Simulator 또는 Android Emulator에 `com.mannal.firstride` 앱이 설치되어
  있어야 한다.
- 앱에는 삭제해도 되는 전용 테스트 계정으로 미리 로그인해 둔다. 흐름은 기존
  로그인 상태를 유지하며 앱을 실행하고, 실제 계정 삭제는 수행하지 않는다.
- 일반 이메일 계정(`PLAIN`)으로 회원 탈퇴 흐름을 실행할 때는
  `E2E_CANCEL_PASSWORD_INPUT`에 임의의 비어 있지 않은 값을 전달한다. 최종
  확인에서 취소하므로 실제 비밀번호는 필요하지 않다.
- 최초 실행 권한 팝업과 온보딩은 미리 완료한다.

## 실행

```bash
maestro test \
  -e E2E_CANCEL_PASSWORD_INPUT='cancel-only' \
  .maestro/account/delete-account-cancel.yaml

maestro test .maestro/privacy/analytics-consent-toggle.yaml
```

두 흐름을 한 번에 실행하려면 다음 명령을 사용한다.

```bash
maestro test \
  -e E2E_CANCEL_PASSWORD_INPUT='cancel-only' \
  .maestro/account/delete-account-cancel.yaml \
  .maestro/privacy/analytics-consent-toggle.yaml
```

## 시나리오 범위

| 분류 | 고정한 동작 |
| --- | --- |
| 안전 경계 | 설정에서 회원 탈퇴 화면에 진입하고 최종 경고에서 취소한 뒤 로그인 상태가 유지됨 |
| 성공 | 분석 수집을 켜면 스위치와 성공 안내가 켜짐 상태를 표시함 |
| 성공 | 분석 수집을 끄면 스위치와 성공 안내가 꺼짐 상태를 표시함 |
| 상태 경계 | 실행 당시 수집이 켜져 있으면 먼저 끈 뒤 동일한 시작 상태로 정규화함 |

계정 실제 삭제 성공은 테스트 계정 파괴를 막기 위해 자동화하지 않는다. 분석
설정 저장 실패는 앱에서 주입 가능한 실패 제어점이 없어 이 기기 E2E 범위에
포함하지 않는다.
