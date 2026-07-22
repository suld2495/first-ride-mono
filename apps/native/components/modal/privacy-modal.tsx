import { ScrollView, Switch, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useClarityAnalyticsSetting } from '@/hooks/useClarityAnalyticsSetting';

const PrivacyModal = () => {
  const { analyticsEnabled, isReady, isSaving, setAnalyticsConsent } =
    useClarityAnalyticsSetting();

  return (
    <ThemeView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <ThemeView style={styles.intro} transparent>
          <Typography variant="h2" weight="bold" style={styles.introTitle}>
            개인정보 처리방침
          </Typography>
          <Typography variant="body2" style={styles.introDescription}>
            어떤 정보를 수집하고 보호하는지 안내해 드려요.
          </Typography>
          <Typography color="tertiary" variant="caption1">
            시행일 2026.07.22
          </Typography>
        </ThemeView>
        <View style={styles.analyticsSection}>
          <View style={styles.analyticsHeading}>
            <Typography variant="h3" weight="bold">
              분석 데이터는 직접 선택해 주세요
            </Typography>
            <Typography color="secondary" variant="body2">
              선택하지 않으면 Microsoft Clarity가 시작되지 않습니다. 언제든 이
              화면에서 다시 끌 수 있습니다.
            </Typography>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingText}>
              <Typography variant="body1" weight="semibold">
                사용 데이터 분석
              </Typography>
              <Typography color="secondary" variant="caption1">
                화면 이용 흐름과 오류·성능 정보를 수집해 서비스 개선에
                사용합니다. 입력한 비밀번호와 인증 토큰은 분석 목적으로 전송하지
                않습니다.
              </Typography>
            </View>
            <Switch
              accessibilityLabel="사용 데이터 분석"
              accessibilityState={{
                checked: analyticsEnabled,
                disabled: !isReady || isSaving,
              }}
              disabled={!isReady || isSaving}
              onValueChange={(enabled) => {
                void setAnalyticsConsent(enabled);
              }}
              testID="privacy-policy-analytics-switch"
              value={analyticsEnabled}
            />
          </View>

          <Typography color="secondary" variant="caption1">
            이 설정을 끄면 현재 분석 세션을 중지하고, 다음 앱 실행에서도
            사용자가 다시 켤 때까지 Clarity를 초기화하지 않습니다.
          </Typography>
        </View>
        <Markdown
          style={{
            body: styles.body,
            heading1: styles.heading1,
            heading2: styles.heading2,
            table: styles.table,
            tr: styles.table,
            hr: styles.hr,
            list_item: styles.listItem,
            strong: styles.strong,
            blockquote: styles.blockquote,
          }}
        >
          {PRIVACY_POLICY_MARKDOWN}
        </Markdown>
      </ScrollView>
    </ThemeView>
  );
};

export default PrivacyModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.foundation.spacing[2.5],
    paddingHorizontal: theme.foundation.spacing[2.5],
  },

  content: {},

  intro: {
    gap: theme.foundation.spacing[2],
    paddingTop: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.divider,
  },

  introTitle: {
    color: theme.colors.brand.text,
  },

  introDescription: {
    color: theme.colors.text.muted,
  },

  analyticsSection: {
    gap: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.divider,
  },

  analyticsHeading: {
    gap: theme.foundation.spacing[2],
  },

  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[4],
    padding: theme.foundation.spacing[4],
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.surface,
  },

  settingText: {
    flex: 1,
    gap: theme.foundation.spacing[1],
  },

  body: {
    color: theme.colors.brand.text,
    fontSize: theme.foundation.typography.size.m,
    marginBottom: theme.foundation.spacing[12],
  },

  heading1: {
    color: theme.colors.brand.text,
    fontSize: theme.foundation.typography.size.l,
    fontWeight: 'bold',
    marginTop: theme.foundation.spacing[6],
  },

  heading2: {
    color: theme.colors.brand.text,
    fontSize: theme.foundation.typography.size.m,
    fontWeight: 'semibold',
    marginVertical: theme.foundation.spacing[2.5],
  },

  table: {
    color: theme.colors.text.secondary,
    borderColor: theme.colors.border.divider,
  },

  listItem: {
    marginBottom: theme.foundation.spacing[1],
  },

  hr: {
    backgroundColor: theme.colors.border.divider,
    marginVertical: theme.foundation.spacing[5],
  },

  strong: {
    fontWeight: 'bold',
  },

  blockquote: {
    backgroundColor: theme.colors.background.surface,
    marginVertical: theme.foundation.spacing[2.5],
  },
}));

export const PRIVACY_POLICY_MARKDOWN = `
# 1. 총칙
이 방침은 개인 운영자(이하 “운영자”)가 모바일 애플리케이션 **‘이루라’**(이하 “서비스”)를 제공하면서 처리하는 개인정보의 항목, 목적, 보유기간과 이용자의 권리를 안내하기 위해 마련되었습니다.

# 2. 수집하는 개인정보 항목 및 방법
## 2-1. 회원가입 및 인증
- 일반 회원: 이메일 주소(사용자 ID), 비밀번호, 닉네임, 직업
- 소셜 회원: 로그인 제공자, 제공자가 발급한 사용자 식별정보와 인증 정보, 닉네임, 직업
- 비밀번호는 인증을 위해 서버로 전송되며 복원할 수 없는 형태로 처리합니다. 소셜 access token은 로그인·가입 처리 중에만 사용합니다.

## 2-2. 서비스 이용
- 설치 기기 ID, 기기 유형과 OS, 푸시 토큰 및 알림 설정
- 루틴, 목표, 수행 기록, 친구 관계와 요청, 퀘스트, 통계·보상 정보
- 사용자가 등록한 한마디, 사용자 이미지, 인증 요청 이미지
- 문의 시 답변 받을 이메일, 문의 제목과 내용

## 2-3. 선택적 분석 데이터
- 사용자가 **사용 데이터 분석**에 동의한 경우에만 화면 방문, 탭·스크롤 등 앱 이용 흐름, 세션 및 기기·앱의 기술 정보를 Microsoft Clarity로 수집합니다.
- 서비스는 Clarity의 사용자 식별 필드에 이메일, 사용자 ID, 닉네임 등 직접 식별정보를 설정하지 않습니다.

## 2-4. 수집 방법
- 회원가입·로그인 및 서비스 이용 중 사용자가 직접 입력하거나 이미지 선택·공유 기능으로 제출
- 알림 권한 허용 후 푸시 토큰 생성, 앱 실행과 API 요청 과정에서 기기 정보 생성
- 개인정보 처리방침 상단에서 분석 수집에 동의한 이후 Clarity SDK를 통한 자동 수집

# 3. 개인정보 이용 목적
- 회원가입, 로그인, 계정 관리와 부정 이용 방지
- 루틴·친구·퀘스트·통계·보상 등 서비스 기능 제공
- 인증 요청 이미지 처리와 사용자 맞춤 화면 제공
- 푸시 알림 발송과 알림 설정 관리
- 문의 접수, 답변과 운영 공지
- 동의한 이용자에 한해 사용성·오류·성능 분석 및 서비스 개선

# 4. 개인정보 제3자 제공
- 운영자는 이용자의 개인정보를 별도 동의 없이 제3자에게 판매하거나 광고 목적으로 제공하지 않습니다.
- 소셜 로그인, 푸시 알림, 분석 기능을 이용할 때에는 이용자가 선택한 기능 수행에 필요한 정보가 해당 서비스 제공자에게 전송될 수 있습니다.
- 법령에 근거가 있거나 적법한 절차에 따른 요청이 있는 경우에는 관계 법령에 따라 제공할 수 있습니다.

# 5. 외부 서비스 및 개인정보 처리위탁
| 제공자 | 이용 목적 | 처리되는 정보 |
|---|---|---|
| Cloudtype | 서버 호스팅과 서비스 데이터 처리 | 계정, 인증, 서비스 이용 및 문의 정보 |
| Microsoft Clarity | 동의한 이용자의 앱 사용성·오류·성능 분석 | 화면 이용 흐름, 세션, 기기·앱 기술 정보 |
| 카카오 | 카카오 계정 로그인 | 카카오 사용자 식별정보와 일회성 인증 정보 |
| Apple | Apple 계정 로그인 및 iOS 푸시 알림 | Apple 사용자 식별정보·인증 정보, 푸시 토큰 |
| Expo Push Service | 기기별 푸시 알림 중계 | 푸시 토큰, 기기 유형, 알림 내용 |
| Google Firebase Cloud Messaging | Android 푸시 알림 전달 | 푸시 토큰과 알림 내용 |

각 외부 서비스는 기능 제공에 필요한 범위에서만 사용합니다. 국외 사업자의 서비스 이용 과정에서 정보가 국외 서버에서 처리될 수 있으며, 이용자는 해당 선택 기능을 사용하지 않거나 앱 설정에서 중지할 수 있습니다.

# 6. 보유 및 파기
- 계정 및 서비스 이용 정보: 회원 탈퇴 시까지
- access token·refresh token: 로그아웃, 회원 탈퇴 또는 토큰 만료 시까지
- 푸시 토큰: 알림 해제, 로그아웃 또는 회원 탈퇴 시까지
- 문의 정보: 문의 처리 목적 달성 시까지
- Clarity 분석 정보: Microsoft Clarity 프로젝트에 설정된 보유기간 동안
- 관계 법령상 보존 의무가 있는 경우에는 해당 기간 동안 분리 보관한 뒤 파기합니다.
- 전자파일은 복구하기 어려운 방법으로 삭제합니다.

# 7. 이용자 권리 및 행사 방법
- 앱 설정에서 계정 정보를 확인하고 회원 탈퇴를 요청할 수 있습니다.
- 분석 수집은 **개인정보 처리방침 상단의 사용 데이터 분석**에서 언제든 켜거나 끌 수 있습니다. 끄면 현재 Clarity 세션을 중지하고 다음 실행부터 SDK를 시작하지 않습니다.
- 개인정보 열람·정정·삭제·처리정지는 아래 이메일로 요청할 수 있습니다.

# 8. 개인정보 자동수집 장치
- 신규 설치에서는 Clarity를 초기화하지 않습니다.
- 이용자가 사용 데이터 분석을 직접 켠 경우에만 Clarity가 시작됩니다.
- 분석 수집을 끄면 이후 세션 데이터 수집을 중지합니다.

# 9. 개인정보 보호조치
- 인증 토큰은 기기의 보안 저장소에 보관합니다.
- 통신 구간을 보호하고, 개인정보 접근 범위를 서비스 제공에 필요한 수준으로 제한합니다.
- 비밀번호와 인증 토큰을 분석 이벤트나 로그의 사용자 식별값으로 사용하지 않습니다.

# 10. 개인정보 보호책임자
- 책임자: 김문성(운영자)  
- 이메일: irura@gmail.com

# 11. 고지 의무
- 본 방침은 2026-07-22부터 시행합니다.
- 내용 변경 시 적용일과 변경 내용을 앱 내에서 안내합니다.
`;
