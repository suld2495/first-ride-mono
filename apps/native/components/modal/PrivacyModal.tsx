import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';

import ThemeView from '../common/ThemeView';

const PrivacyModal = () => {
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
            blockquote: styles.blockquote,
          }}
        >
          {MARKDOWN}
        </Markdown>
      </ScrollView>
    </ThemeView>
  );
};

export default PrivacyModal;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      marginTop: 10,
      paddingHorizontal: 10,
    },

    content: {},

    body: {
      color: COLORS[colorScheme].text,
      fontSize: 14,
      marginBottom: 50,
    },

    heading1: {
      color: COLORS[colorScheme].text,
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 20,
    },

    heading2: {
      color: COLORS[colorScheme].text,
      fontSize: 14,
      fontWeight: 'semibold',
      marginVertical: 10,
    },

    table: {
      color: COLORS[colorScheme].text,
      borderColor: COLORS[colorScheme].grey,
    },

    listItem: {
      marginBottom: 5,
    },

    hr: {
      backgroundColor: COLORS[colorScheme].grey,
      marginVertical: 20,
    },

    strong: {
      fontWeight: 'bold',
    },

    blockquote: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
      marginVertical: 10,
    },
  });

const MARKDOWN = `
# 1. 총칙
이 방침은 개인 운영자(이하 “운영자”)가 모바일 애플리케이션 **‘처음처럼’**(이하 “서비스”)를 제공함에 있어, 「개인정보 보호법」 등 관계 법령에 따라 이용자의 개인정보를 보호하고 권익을 보장하기 위해 마련되었습니다.

# 2. 수집하는 개인정보 항목 및 방법
## 2-1. 필수 수집 항목
- 휴대전화번호  
- OS 버전, 기기식별값  
- **수집 방법** : 회원 가입·앱 실행 시 자동 수집  
- **보유 기간** : 회원 탈퇴 즉시 파기  

## 2-2. 선택 수집 항목
- 닉네임, 프로필 사진  
- **수집 방법** : 사용자가 입력  
- **보유 기간** : 탈퇴 또는 동의 철회 시  

## 2-3. 카메라·사진 관련 항목 *(해당 기능 사용 시)*
- 촬영 사진 파일, 이미지 메타데이터(EXIF)  
- **수집 방법** : 사용자가 카메라 촬영·갤러리 업로드 시  
- **이용 목적** : 콘텐츠 게시, 프로필 이미지 설정  
- **보유 기간** : 이미지 삭제 또는 회원 탈퇴 시  

> ※ 「전자상거래법」 등 관계 법령에 따라 결제·거래내역은 최대 **5년**까지 별도 보관될 수 있습니다.

# 3. 개인정보 이용 목적
- 회원관리(본인확인, 부정 이용 방지)  
- 서비스 제공 및 맞춤형 추천  
- 고객 문의 대응·공지사항 전달  
- 통계 분석 및 서비스 개선  

# 4. 개인정보 제3자 제공
- 운영자는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다.  
- 단, 법령에 근거가 있거나 수사기관의 적법한 절차에 따른 요청이 있을 경우 예외로 합니다.

# 5. 개인정보 처리위탁
- **클라우드 서버 호스팅** : cloudtype  
- 모든 수탁사와는 개인정보보호 의무를 명시한 계약을 체결합니다.

# 6. 보유 및 파기
- **보유 원칙** : 목적 달성 즉시 파기  
- **파기 방법** :  
  - 전자파일 → 복구 불가 방식의 삭제  
  - 인쇄물 → 분쇄 또는 소각  

# 7. 이용자 권리 및 행사 방법
- 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다.  
- 앱 **설정 › 개인정보** 메뉴 또는 이메일(suld2495@naver.com)로 요청 시, 24시간 이내에 조치 결과를 안내합니다.

# 8. 개인정보 자동수집 장치
- 쿠키, Firebase Analytics 로그를 통해 서비스 이용 통계를 수집할 수 있습니다.  
- 사용자는 기기·앱 설정에서 수집을 거부할 수 있습니다.

# 9. 개인정보 보호책임자
- 책임자: 김문성(운영자)  
- 연락처: 010-2114-2218
- 이메일: suld2495@naver.com

# 10. 고지 의무
- 본 방침은 2025-06-15 제정되었습니다.  
- 내용 변경 시 최소 **7일 전** 앱 내 공지합니다.
`;
