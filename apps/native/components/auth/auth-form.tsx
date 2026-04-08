import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import PixelCard from '@/components/ui/pixel-card';
import PixelText from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';

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
      showsVerticalScrollIndicator={false}
    >
      <ThemeView style={styles.container}>
        <PixelText variant="title" glow style={styles.title}>
          {title}
        </PixelText>
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
    gap: 20,
  },

  title: {
    textAlign: 'center',
  },

  form: {
    gap: 10,
  },
});
