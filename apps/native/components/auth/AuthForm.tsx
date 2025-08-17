import { StyleSheet, View } from "react-native";
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
    <View style={styles.container}>
      <ThemeText variant="title" style={styles.title}>{title}</ThemeText>
      <View style={styles.form}>
        {children}
      </View>
    </View>
  )
};

export default AuthForm;

const createStyles = (colorScheme: 'light' | 'dark') => (
  StyleSheet.create({
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