import { PRIVACY_POLICY_MARKDOWN } from '@/components/modal/privacy-modal';
import { TERMS_POLICY_MARKDOWN } from '@/components/modal/terms-policy-modal';

describe('개인정보 처리 안내', () => {
  it('실제 서비스명과 수집 항목을 안내한다', () => {
    expect(PRIVACY_POLICY_MARKDOWN).toContain('이루라');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('이메일');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('사용자 ID');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('비밀번호');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('닉네임');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('직업');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('기기 ID');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('푸시 토큰');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('문의');
  });

  it('실제로 사용하는 외부 서비스와 분석 수집 중지 방법을 안내한다', () => {
    expect(PRIVACY_POLICY_MARKDOWN).toContain('Microsoft Clarity');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('Expo Push Service');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('카카오');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('Apple');
    expect(PRIVACY_POLICY_MARKDOWN).toContain('Cloudtype');
    expect(PRIVACY_POLICY_MARKDOWN).toContain(
      '개인정보 처리방침 상단의 사용 데이터 분석',
    );
  });

  it('실제 앱과 다른 이전 서비스명과 수집 설명을 제거한다', () => {
    expect(PRIVACY_POLICY_MARKDOWN).not.toContain('처음처럼');
    expect(PRIVACY_POLICY_MARKDOWN).not.toContain('Firebase Analytics');
    expect(PRIVACY_POLICY_MARKDOWN).not.toContain('휴대전화번호');
    expect(TERMS_POLICY_MARKDOWN).not.toContain('처음처럼');
    expect(TERMS_POLICY_MARKDOWN).not.toContain('Firebase Analytics');
  });
});
