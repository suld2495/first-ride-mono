import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Svg, { Path } from 'react-native-svg';

interface KakaoLoginButtonProps extends Omit<PressableProps, 'style'> {
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

// 카카오 로고 아이콘
function KakaoIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.89 5.31 4.71 6.73L5.58 21.5c-.09.37.28.68.62.52l4.79-2.63c.33.03.67.05 1.01.05 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
        fill="#000000"
      />
    </Svg>
  );
}

export function KakaoLoginButton({
  loading,
  disabled,
  style,
  ...props
}: KakaoLoginButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel="카카오로 로그인"
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color="#000000" />
        ) : (
          <>
            <KakaoIcon />
            <Text style={styles.text}>카카오로 로그인</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#FEE500', // 카카오 브랜드 노란색
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default KakaoLoginButton;
