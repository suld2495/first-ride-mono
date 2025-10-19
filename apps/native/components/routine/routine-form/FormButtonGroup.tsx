import Button from "@/components/common/Button";
import Link from "@/components/common/Link";
import ThemeView from "@/components/common/ThemeView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ModalType } from "@/hooks/useModal";
import { COLORS } from "@/theme/colors";
import { FormContextType } from "@repo/shared/components";
import { RoutineForm } from "@repo/types";
import { StyleSheet } from "react-native";

interface FormButtonGroupProps {
  type: ModalType;
  useForm: () => FormContextType<RoutineForm>;
}

const FormButtonGroup = ({ type, useForm }: FormButtonGroupProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const { enabled: isValid, handleSubmit } = useForm();

  return (
    <ThemeView style={styles.buttonContainer}>
      <Link
        title="취소"
        href=".."
        style={[styles.cancelButton, styles.button]}
      />
      {type === 'routine-add' ? (
        <Button
          title="추가"
          onPress={() => handleSubmit()}
          style={[
            styles.addButton,
            styles.button,
            !isValid ? styles.disabledButton : {},
          ]}
          disabled={!isValid}
        />
      ) : (
        <Button
          title="수정"
          onPress={() => handleSubmit()}
          style={[
            styles.addButton,
            styles.button,
            !isValid ? styles.disabledButton : {},
          ]}
          disabled={!isValid}
        />
      )}
    </ThemeView>
  )
};

export default FormButtonGroup;

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

    addButton: {
      backgroundColor: COLORS[colorScheme].button,
    },

    disabledButton: {
      opacity: 0.5,
    },
});