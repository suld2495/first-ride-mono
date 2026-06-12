import {
  type PressableProps,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';

import { SocialLoginButton } from './social-login-button';

// 카카오 브랜드 색상 (변경 불가)
const KAKAO_YELLOW = '#FEE500';
const KAKAO_BLACK = '#000000';

interface KakaoLoginButtonProps extends Omit<PressableProps, 'style'> {
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

function KakaoIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.89 5.31 4.71 6.73L5.58 21.5c-.09.37.28.68.62.52l4.79-2.63c.33.03.67.05 1.01.05 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
        fill={KAKAO_BLACK}
      />
    </Svg>
  );
}

export function KakaoLoginButton({ style, ...props }: KakaoLoginButtonProps) {
  return (
    <SocialLoginButton
      backgroundColor={KAKAO_YELLOW}
      textColor={KAKAO_BLACK}
      accessibilityLabel="카카오로 로그인"
      contentStyle={styles.content}
      style={[styles.button, style]}
      {...props}
    >
      <View style={styles.icon}>
        <KakaoIcon />
      </View>
      <Typography variant="body" style={styles.text}>
        카카오로 로그인
      </Typography>
    </SocialLoginButton>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    borderRadius: theme.foundation.radii.s,
    shadowOpacity: 0,
    elevation: 0,
  },

  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  icon: {
    position: 'absolute',
    left: 0,
  },

  text: {
    fontWeight: theme.foundation.typography.weight.medium,
    color: KAKAO_BLACK,
    textAlign: 'center',
  },
}));

export default KakaoLoginButton;
