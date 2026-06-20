import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import PixelCard from '@/components/ui/pixel-card';
import ThemeView from '@/components/ui/theme-view';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { baseFoundation } from '@/theme/tokens';

interface AuthFormProps {
  title: string;
  children: React.ReactNode;
}

const AuthForm = ({ title, children }: AuthFormProps) => {
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollContent}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      enableResetScrollToCoords={false}
      showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
    >
      <ThemeView style={styles.container}>
        <Typography variant="title" weight="semibold" glow style={styles.title}>
          {title}
        </Typography>
        <PixelCard>
          <ThemeView style={styles.form}>{children}</ThemeView>
        </PixelCard>
      </ThemeView>
    </KeyboardAwareScrollView>
  );
};

export default AuthForm;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  container: {
    gap: baseFoundation.dimension.x20,
  },

  title: {
    textAlign: 'center',
  },

  form: {
    gap: baseFoundation.dimension.x10,
  },
});
