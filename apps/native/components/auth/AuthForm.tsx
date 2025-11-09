import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import ThemeText from "../common/ThemeText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { COLORS } from "@/theme/colors";

interface AuthFormProps {
  title: string;
  children: React.ReactNode;
}

const AuthForm = ({ title, children }: AuthFormProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <ThemeText variant="title" style={styles.title}>{title}</ThemeText>
          <View style={styles.form}>
            {children}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
};

export default AuthForm;

const createStyles = (colorScheme: 'light' | 'dark') => (
  StyleSheet.create({
    keyboardView: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },

    container: {
      gap: 20
    },

    title: {
      color: COLORS[colorScheme].text,
      textAlign: 'center',
    },

    form: {
      gap: 10
    }
  })
);