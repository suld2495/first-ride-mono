import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { palette } from '@/theme/tokens';

const AUTH_PAGE_HORIZONTAL_PADDING = 32;
const AUTH_PAGE_MAX_WIDTH = 430;

interface AuthPageProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

interface AuthPageHeaderProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
}

interface AuthPageSectionProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AuthPageRoot = ({ children, style, contentStyle }: AuthPageProps) => {
  const insets = useSafeAreaInsets();

  return (
    <ThemeView style={[styles.container, style]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <ThemeView
          transparent
          style={[
            styles.content,
            {
              paddingTop: insets.top + 12,
              paddingBottom: Math.max(insets.bottom, 24),
            },
            contentStyle,
          ]}
        >
          {children}
        </ThemeView>
      </KeyboardAwareScrollView>
    </ThemeView>
  );
};

const Header = ({ children, style, title }: AuthPageHeaderProps) => {
  return (
    <View style={[styles.header, style]}>
      {title ? (
        <Typography variant="title" weight="semibold" style={styles.title}>
          {title}
        </Typography>
      ) : null}
      {children}
    </View>
  );
};

const Body = ({ children, style }: AuthPageSectionProps) => {
  return <View style={[styles.body, style]}>{children}</View>;
};

const AuthPage = Object.assign(AuthPageRoot, {
  Header,
  Body,
});

export default AuthPage;

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    backgroundColor: palette.theme.blue[10],
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: AUTH_PAGE_MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: AUTH_PAGE_HORIZONTAL_PADDING,
  },

  header: {
    alignItems: 'center',
  },

  title: {
    color: palette.theme.gray[70],
    textAlign: 'center',
  },

  body: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
  },
}));
