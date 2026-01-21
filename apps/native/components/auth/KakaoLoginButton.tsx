import {
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';

import { Typography } from '@/components/common/Typography';

import { SocialLoginButton } from './SocialLoginButton';

// 카카오 브랜드 색상 (변경 불가)
const KAKAO_YELLOW = '#FEE500';
const KAKAO_BLACK = '#000000';

interface KakaoLoginButtonProps extends Omit<PressableProps, 'style'> {
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

function KakaoIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.89 5.31 4.71 6.73L5.58 21.5c-.09.37.28.68.62.52l4.79-2.63c.33.03.67.05 1.01.05 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
        fill={KAKAO_BLACK}
      />
    </Svg>
  );
}

export function KakaoLoginButton({ ...props }: KakaoLoginButtonProps) {
  return (
    <SocialLoginButton
      backgroundColor={KAKAO_YELLOW}
      textColor={KAKAO_BLACK}
      accessibilityLabel="카카오로 로그인"
      {...props}
    >
      <KakaoIcon />
      <Typography variant="body" style={styles.text}>
        카카오로 로그인
      </Typography>
    </SocialLoginButton>
  );
}

const styles = StyleSheet.create((theme) => ({
  text: {
    fontWeight: theme.foundation.typography.weight.medium,
    color: KAKAO_BLACK,
  },
}));

export default KakaoLoginButton;
