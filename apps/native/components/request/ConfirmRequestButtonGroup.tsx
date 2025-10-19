import { useColorScheme } from "@/hooks/useColorScheme";
import { COLORS } from "@/theme/colors";
import { StyleSheet } from "react-native";
import ThemeView from "../common/ThemeView";
import Button from "../common/Button";
import { RequestResponseStatus } from "@repo/types";
import { FormContextType } from "@repo/shared/components";

interface ConfirmRequestButtonGroupProps {
  onSubmit: (status: RequestResponseStatus, comment: string) => Promise<void>;
  useForm: () => FormContextType<{ comment: string }>;
}

const ConfirmRequestButtonGroup = ({ onSubmit, useForm }: ConfirmRequestButtonGroupProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const { form } = useForm();

  return (
    <ThemeView style={styles.buttonContainer}>
      <Button
        title="승인"
        onPress={() => onSubmit('PASS', form.comment)}
        style={[styles.addButton, styles.button]}
      />
      <Button
        title="거절"
        onPress={() => onSubmit('DENY', form.comment)}
        style={[styles.cancelButton, styles.button]}
      />
    </ThemeView>
  )
};

export default ConfirmRequestButtonGroup;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    buttonContainer: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },

    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    date_button: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    button: {
      flex: 1,
    },

    cancelButton: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    addButton: {
      backgroundColor: COLORS[colorScheme].button,
    },
  });