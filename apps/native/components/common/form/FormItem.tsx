import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';

import ThemeText from '../ThemeText';
import ThemeView from '../ThemeView';

interface FormItemProps {
  label?: string;
  children: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  touched?: boolean;
}

const FormItem = ({
  label,
  children,
  error,
  errorMessage,
  touched,
}: FormItemProps) => {
  return (
    <ThemeView style={styles.container}>
      {label && (
        <ThemeText style={styles.label} variant="medium">
          {label}
        </ThemeText>
      )}
      {children}
      {error && touched && (
        <ThemeText style={styles.error} variant="caption">
          {errorMessage}
        </ThemeText>
      )}
    </ThemeView>
  );
};

export default FormItem;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },

  label: {
    width: '100%',
  },

  error: {
    color: COLORS.light.error,
  },
});
