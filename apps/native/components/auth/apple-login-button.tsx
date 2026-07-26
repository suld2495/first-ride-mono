import Ionicons from '@expo/vector-icons/Ionicons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import {
  Platform,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

import { SocialLoginButton } from './social-login-button';

const APPLE_BLACK = '#000000';
const APPLE_WHITE = '#FFFFFF';

interface AppleLoginButtonProps extends Omit<PressableProps, 'style'> {
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppleLoginButton({
  loading = false,
  style,
  ...props
}: AppleLoginButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (Platform.OS !== 'ios') {
      return () => {
        isMounted = false;
      };
    }

    void AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (isMounted) {
          setIsAvailable(available);
        }

        return available;
      })
      .catch(() => {
        if (isMounted) {
          setIsAvailable(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAvailable) {
    return null;
  }

  return (
    <SocialLoginButton
      {...props}
      accessibilityLabel="Apple로 로그인"
      accessibilityRole="button"
      accessibilityState={{ busy: loading }}
      backgroundColor={APPLE_BLACK}
      contentStyle={styles.content}
      loading={loading}
      style={[styles.button, style]}
      testID="apple-login-button"
      textColor={APPLE_WHITE}
    >
      <View style={styles.logo} testID="apple-login-logo">
        <Ionicons
          name="logo-apple"
          size={baseFoundation.dimension.x20}
          color={APPLE_WHITE}
        />
      </View>
      <Typography variant="body" style={styles.text}>
        Apple로 로그인
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
  logo: {
    position: 'absolute',
    left: baseFoundation.dimension.x0,
    width: baseFoundation.dimension.x20,
    height: baseFoundation.dimension.x20,
    paddingBottom: baseFoundation.dimension.x1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: theme.foundation.typography.weight.medium,
    color: APPLE_WHITE,
    textAlign: 'center',
  },
}));
