# 이루라 App Store 개인정보 응답 기준

작성일: 2026-07-22  
대상: `apps/native` production 빌드

이 문서는 App Store Connect의 **App Privacy** 응답을 앱과 SDK의 실제 동작에 맞게 입력하기 위한 기준이다. production 빌드에 SDK 또는 데이터 처리가 추가되면 코드와 함께 이 문서를 갱신한다.

## 데이터 수집 여부

- **Yes, we collect data from this app**를 선택한다.
- 아래 데이터는 광고 추적이나 데이터 브로커 제공에 사용하지 않는다.
- Microsoft Clarity 항목은 사용자가 앱의 **설정 › 개인정보 설정 › 사용 데이터 분석**을 켠 경우에만 수집된다.

## App Store Connect 입력값

| Apple 데이터 유형                 | 수집 목적                                  | 사용자 연결 | 추적 사용 | 앱의 실제 처리                                  |
| --------------------------------- | ------------------------------------------ | ----------: | --------: | ----------------------------------------------- |
| Contact Info › Email Address      | App Functionality                          |         Yes |        No | 일반 계정 ID, 이메일 인증, 문의 답변 주소       |
| Identifiers › User ID             | App Functionality, Product Personalization |         Yes |        No | 계정 ID, 닉네임, 소셜 로그인 식별자             |
| Identifiers › Device ID           | App Functionality                          |         Yes |        No | 앱 설치 기기 ID, Expo 푸시 토큰                 |
| User Content › Photos or Videos   | App Functionality                          |         Yes |        No | 사용자가 선택·공유한 인증 요청 이미지           |
| User Content › Customer Support   | App Functionality                          |         Yes |        No | 문의 이메일, 제목과 내용                        |
| User Content › Other User Content | App Functionality, Product Personalization |         Yes |        No | 루틴, 수행 기록, 한마디, 친구·퀘스트 관련 입력  |
| Usage Data › Product Interaction  | Analytics                                  |          No |        No | Clarity의 화면 방문, 탭·스크롤 등 제품 상호작용 |
| Diagnostics › Performance Data    | Analytics, App Functionality               |          No |        No | Clarity가 수집하는 SDK·앱 성능 정보             |
| Location › Coarse Location        | Analytics                                  |          No |        No | Clarity가 IP 주소에서 추정하는 대략적 위치      |

## 선택하지 않는 데이터 유형

- 이름, 휴대전화번호, 실제 주소
- 정확한 위치
- 연락처 주소록
- 결제·신용·기타 금융 정보
- 건강·피트니스·민감정보
- 오디오 데이터
- 검색·브라우징 기록
- 광고 데이터와 구매 내역
- Crash Data 및 Other Diagnostic Data

## SDK별 확인 사항

### Microsoft Clarity

- 신규 설치와 저장값이 없는 상태에서는 SDK를 초기화하지 않는다.
- 사용자가 분석을 켠 뒤에만 `initialize`와 analytics consent를 호출한다.
- 분석을 끄면 non-consent와 `pause`를 호출하며 다음 실행에서도 초기화하지 않는다.
- 이메일, 사용자 ID, 닉네임을 Clarity custom user ID 또는 custom tag로 설정하지 않는다.
- App Store 응답은 Microsoft 공식 안내에 따라 Product Interaction, Performance Data, IP 기반 Coarse Location을 포함한다.

### 푸시 알림

- 알림 권한을 허용한 실제 기기에서만 Expo Push Token을 생성한다.
- 서버는 토큰과 기기 유형을 저장하고 Expo Push Service를 통해 APNs 또는 FCM으로 알림을 전달한다.
- 로그아웃·회원 탈퇴 시 서버 토큰 삭제를 요청한다.

### 소셜 로그인

- 카카오와 Apple 인증 정보는 사용자가 해당 로그인 방식을 선택했을 때 인증 목적으로만 처리한다.
- 소셜 access token을 분석 이벤트나 영구 사용자 콘텐츠로 저장하지 않는다.

## 출시 전 콘솔 확인

- App Store Connect › App Privacy에서 위 데이터 유형과 목적을 입력하고 **Publish**한다.
- Privacy Policy URL이 앱 내 2026-07-22 처리방침과 같은 내용을 제공하는지 확인한다.
- User Privacy Choices URL을 제공하는 경우 앱의 개인정보 설정 방법을 동일하게 안내한다.
- production archive의 PrivacyInfo.xcprivacy와 포함 SDK 목록을 확인한다.
- production 빌드에서 분석 설정 OFF·ON·OFF 순서로 테스트하고, OFF 상태의 신규 세션이 Clarity에 생성되지 않는지 확인한다.

## 공식 기준

- [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple App Store Connect 개인정보 관리](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)
- [Microsoft Clarity Apple App Store Privacy Guidance](https://learn.microsoft.com/en-us/clarity/mobile-sdk/sdk-apple-appstore-privacy-guidance)
- [Expo Push Notifications Overview](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Service FAQ](https://docs.expo.dev/push-notifications/faq/)
