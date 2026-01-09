import { Button, type ButtonProps } from '@/components/common/Button';

export interface SocialLoginButtonProps
  extends Omit<ButtonProps, 'size' | 'variant' | 'fullWidth'> {
  /**
   * 버튼 배경색 (브랜드 색상)
   */
  backgroundColor: string;

  /**
   * 텍스트/아이콘 색상 (로딩 인디케이터에도 사용)
   */
  textColor: string;
}

/**
 * 소셜 로그인 공통 버튼 컴포넌트
 */
export function SocialLoginButton({
  backgroundColor,
  textColor,
  ...props
}: SocialLoginButtonProps) {
  return (
    <Button
      size="lg"
      fullWidth
      backgroundColor={backgroundColor}
      textColor={textColor}
      {...props}
    />
  );
}

export default SocialLoginButton;
