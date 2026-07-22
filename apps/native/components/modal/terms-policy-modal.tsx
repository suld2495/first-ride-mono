import { ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';

const TermsPolicyModal = () => {
  return (
    <ThemeView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <ThemeView style={styles.intro} transparent>
          <Typography variant="h2" weight="bold" style={styles.introTitle}>
            이용약관
          </Typography>
          <Typography variant="body2" style={styles.introDescription}>
            서비스를 이용하기 전에 꼭 확인해 주세요.
          </Typography>
          <Typography color="tertiary" variant="caption1">
            시행일 2025.06.15
          </Typography>
        </ThemeView>
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
          }}
        >
          {TERMS_POLICY_MARKDOWN}
        </Markdown>
      </ScrollView>
    </ThemeView>
  );
};

export default TermsPolicyModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.foundation.spacing[7],
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
    marginBottom: theme.foundation.spacing[5],
  },

  heading2: {
    color: theme.colors.brand.text,
    fontSize: theme.foundation.typography.size.m,
    fontWeight: 'semibold',
    marginTop: theme.foundation.spacing[5],
    marginBottom: theme.foundation.spacing[2],
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
}));

export const TERMS_POLICY_MARKDOWN = `
# Ⅰ. 이용약관

## 제 1 장  총칙
**1. 목적**  
모바일 애플리케이션 **'이루라'**(이하 "서비스")를 개발·운영하는 개인(이하 "운영자")와 회원 간 권리·의무 및 이용조건을 규정합니다.

**2. 정의**  
- **회원**: 본 약관에 동의하고 서비스 이용계약을 체결한 자  
- **콘텐츠**: 서비스 내에 게시·전송되는 모든 텍스트·음성·영상·코드 등  

**3. 약관의 명시·개정**  
운영자는 약관을 앱 **설정 › 정책** 메뉴에 게시하며, 개정 시 적용일 7일 전(회원에게 불리한 변경은 30일 전)부터 고지합니다.

## 제 2 장  이용계약
1. **계약 성립**: 회원가입 화면에서 '동의' 버튼을 누르면 이용계약이 성립합니다.  
2. **회원 탈퇴 및 자격 제한**: 회원은 언제든지 '계정삭제' 기능으로 탈퇴할 수 있으며, 운영자는 법령·약관 위반 시 이용을 제한·정지·해지할 수 있습니다.

## 제 3 장  서비스 이용
1. **제공 시간**: 연중무휴 24시간(점검·천재지변 등 예외 가능)  
2. **광고 게재**: 운영자는 서비스 화면·이메일 등에 광고를 게재할 수 있습니다.  
3. **유료 서비스**: 별도 고지된 정책 및 결제수단을 따릅니다.

## 제 4 장  권리·의무
- **운영자의 의무**  
  - 관련 법령 준수  
  - 안정적 서비스 제공  
  - 개인정보 보호  
- **회원의 의무**  
  - 타인 정보 도용 금지  
  - 불법·유해 콘텐츠 금지  
  - 지식재산권 존중

## 제 5 장  지식재산권
서비스 '이루라' 및 그 콘텐츠에 대한 저작권·지식재산권은 운영자에게 귀속되며, 회원은 개인적·비상업적 범위를 넘어 무단 사용할 수 없습니다.

## 제 6 장  손해배상 및 면책
1. 운영자는 무료로 제공되는 서비스로 인한 손해에 대해 책임을 지지 않습니다.  
2. 천재지변·통신사 장애 등 불가항력으로 인한 손해에 대해 면책됩니다.

## 제 7 장  분쟁 해결
분쟁이 원만히 해결되지 않을 경우 **서울중앙지방법원**을 전속 관할 법원으로 합니다.

**부칙**: 본 약관은 2025-06-15부터 시행합니다.

---

# Ⅱ. 개인정보 처리 안내

서비스가 처리하는 개인정보의 항목, 목적, 외부 서비스, 보유기간과 이용자 권리는 앱의 **개인정보 처리방침**에서 확인할 수 있습니다.

사용 데이터 분석은 기본적으로 꺼져 있으며, 회원은 **설정 › 개인정보 설정 › 사용 데이터 분석**에서 Microsoft Clarity 수집 여부를 직접 선택하고 언제든 중지할 수 있습니다.
`;
