import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PageHeader from '@/components/layout/page-header';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { palette } from '@/theme/tokens';

const SIGN_UP_PAGE_HORIZONTAL_PADDING = 32;
const SIGN_UP_PAGE_MAX_WIDTH = 430;

interface SignUpPageProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface SignUpPageHeaderProps {
  onBackPress: () => void;
  title: string;
}

interface SignUpPageBodyProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const SignUpPageRoot = ({ children, style }: SignUpPageProps) => {
  const insets = useSafeAreaInsets();

  return (
    <ThemeView testID="sign-up-page" style={[styles.container, style]}>
      <StatusBar style="dark" />
      <View
        style={[
          styles.safeContent,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        {children}
      </View>
    </ThemeView>
  );
};

const Header = ({ onBackPress, title }: SignUpPageHeaderProps) => (
  <PageHeader title={title} showBackButton onBackPress={onBackPress} />
);

const Body = ({ children, style }: SignUpPageBodyProps) => (
  <KeyboardAwareScrollView
    contentContainerStyle={styles.scrollContent}
    enableOnAndroid
    keyboardShouldPersistTaps="handled"
    enableResetScrollToCoords={false}
    showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
  >
    <ThemeView
      testID="sign-up-page-body"
      transparent
      style={[styles.body, style]}
    >
      {children}
    </ThemeView>
  </KeyboardAwareScrollView>
);

const SignUpPage = Object.assign(SignUpPageRoot, {
  Header,
  Body,
});

export default SignUpPage;

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    backgroundColor: palette.theme.blue[10],
  },

  safeContent: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  body: {
    flexGrow: 1,
    width: '100%',
    maxWidth: SIGN_UP_PAGE_MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: SIGN_UP_PAGE_HORIZONTAL_PADDING,
  },
}));
