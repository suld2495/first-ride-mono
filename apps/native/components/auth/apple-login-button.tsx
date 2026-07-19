import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import {
  Platform,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

interface AppleLoginButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppleLoginButton({
  onPress,
  loading = false,
  disabled = false,
  style,
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

  const isDisabled = disabled || loading;

  return (
    <View
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      pointerEvents={isDisabled ? 'none' : 'auto'}
      style={[styles.container, isDisabled ? styles.disabled : null, style]}
    >
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={
          AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
        }
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={baseFoundation.radii.s}
        onPress={onPress}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    width: '100%',
    height: baseFoundation.dimension.x48,
  },
  button: {
    width: '100%',
    height: baseFoundation.dimension.x48,
  },
  disabled: {
    opacity: baseFoundation.opacity.disabled,
  },
}));
