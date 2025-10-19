import { COLORS } from "@/theme/colors";
import Button from "../common/Button";
import Link from "../common/Link";
import ThemeView from "../common/ThemeView";
import { StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FormContextType } from "@repo/shared/components";

interface RequetButtonGroupProps {
  useForm: () => FormContextType<{ image: string }>;
}

const RequetButtonGroup = ({ useForm }: RequetButtonGroupProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const { enabled, handleSubmit } = useForm();

  return (
    <ThemeView style={styles.buttonContainer}>
      <Link
        title="취소"
        href=".."
        style={[styles.cancelButton, styles.button]}
      />
      <Button
        title="요청"
        onPress={() => handleSubmit()}
        style={[
          styles.requestButton,
          styles.button,
          !enabled ? styles.disabledButton : {},
        ]}
        disabled={!enabled}
      />
    </ThemeView>
  )
};

export default RequetButtonGroup;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    buttonContainer: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },

    button: {
      flex: 1,
    },

    cancelButton: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    requestButton: {
      backgroundColor: COLORS[colorScheme].button,
    },

    disabledButton: {
      opacity: 0.5,
    },
  });