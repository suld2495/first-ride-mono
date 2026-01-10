import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

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
        <Typography variant="title" style={styles.title}>
          {title}
        </Typography>
        <ThemeView style={styles.form}>{children}</ThemeView>
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
