import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { borderColors, contentColors } from '@repo/design-system';

import { useColorScheme } from '@/hooks/useColorScheme';

import ThemeView from '../common/ThemeView';

const TermsPolicyModal = () => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <ThemeView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
          {MARKDOWN}
        </Markdown>
      </ScrollView>
    </ThemeView>
  );
};

export default TermsPolicyModal;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      marginTop: 30,
      paddingHorizontal: 10,
    },

    content: {},

    body: {
      color: contentColors.body[colorScheme],
      fontSize: 14,
      marginBottom: 50,
    },

    heading1: {
      color: contentColors.heading[colorScheme],
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },

    heading2: {
      color: contentColors.title[colorScheme],
      fontSize: 14,
      fontWeight: 'semibold',
      marginVertical: 10,
    },

    table: {
      color: contentColors.body[colorScheme],
      borderColor: borderColors.divider[colorScheme],
    },

    listItem: {
      marginBottom: 5,
    },

    hr: {
      backgroundColor: borderColors.divider[colorScheme],
      marginVertical: 20,
    },

    strong: {
      fontWeight: 'bold',
    },
  });

const MARKDOWN = `
# Ⅰ. 이용약관

## 제 1 장  총칙
**1. 목적**  
모바일 애플리케이션 **'처음처럼'**(이하 "서비스")을 개발·운영하는 개인(이하 "운영자")와 회원 간 권리·의무 및 이용조건을 규정합니다.

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
서비스 '처음처럼' 및 그 콘텐츠에 대한 저작권·지식재산권은 운영자에게 귀속되며, 회원은 개인적·비상업적 범위를 넘어 무단 사용할 수 없습니다.

## 제 6 장  손해배상 및 면책
1. 운영자는 무료로 제공되는 서비스로 인한 손해에 대해 책임을 지지 않습니다.  
2. 천재지변·통신사 장애 등 불가항력으로 인한 손해에 대해 면책됩니다.

## 제 7 장  분쟁 해결
분쟁이 원만히 해결되지 않을 경우 **서울중앙지방법원**을 전속 관할 법원으로 합니다.

**부칙**: 본 약관은 2025-06-15부터 시행합니다.

---

# Ⅱ. 개인정보처리방침

## 1. 수집하는 개인정보 항목

- **필수 수집 항목**  
  - 휴대전화번호  
  - OS 버전  
  - 기기식별값  
  - 수집 방법: 회원가입 및 앱 실행 시 자동 수집  
  - 보유 기간: 회원 탈퇴 시까지  

- **선택 수집 항목**  
  - 프로필 사진  
  - 닉네임  
  - 수집 방법: 사용자가 입력  
  - 보유 기간: 탈퇴 또는 동의 철회 시  

- **카메라·사진 관련 수집 항목** *(앱에서 카메라 촬영·갤러리 업로드 기능을 제공할 경우에 한해 적용)*  
  - 촬영 사진 파일, 이미지 메타데이터(EXIF 등)  
  - 수집 방법: 사용자가 사진 촬영·업로드 시  
  - 이용 목적: 콘텐츠 등록 및 사용자 프로필 이미지 설정  
  - 보유 기간: 해당 이미지 삭제 또는 회원 탈퇴 시  

※ 전자상거래법 등에 따라 결제·거래내역은 최대 5년간 보관될 수 있습니다.

## 2. 수집 목적
- 회원관리(본인확인·중복가입 방지)  
- 서비스 '처음처럼' 제공 및 맞춤형 추천  
- 문의 대응 및 공지사항 전달  

## 3. 개인정보 제3자 제공
운영자는 회원 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 법령 근거가 있는 경우 예외로 합니다.

## 4. 개인정보 처리위탁
- 클라우드 호스팅(서버 운영)  
*모든 수탁사와 개인정보보호 의무를 명시한 계약을 체결합니다.*

## 5. 이용자 권리
회원은 앱 **설정 › 개인정보** 메뉴에서 자신의 정보를 조회·수정·삭제하거나 처리정지를 요청할 수 있습니다.

## 6. 개인정보 파기
- 목적 달성 즉시 파기  
- 전자파일: 복구 불가 방식으로 삭제  
- 인쇄물: 분쇄·소각

## 7. 개인정보 자동수집 장치
쿠키·Firebase Analytics 등 로그 데이터를 수집할 수 있으며, 사용자는 기기 설정에서 거부할 수 있습니다.

## 8. 개인정보 보호책임자
- 책임자: 김문성(운영자)  
- 연락처: 010-2114-2218
- 이메일: suld2495@naver.com

## 9. 정책 변경 고지
본 방침은 2025-06-15 제정되었으며, 변경 시 최소 7 일 전 앱 내 공지합니다.
`;
