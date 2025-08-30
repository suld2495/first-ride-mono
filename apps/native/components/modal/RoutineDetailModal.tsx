import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import {
  useDeleteRoutineMutation,
  useRoutineDetailQuery,
} from '@repo/shared/hooks/useRoutine';
import { useRoutineStore } from '@/store/routine.store';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { COLORS } from '@/theme/colors';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';
import { useShallow } from 'zustand/shallow';

const RoutineDetailModal = () => {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const [routineId, setRoutineForm] = useRoutineStore(useShallow((state) => [
    state.routineId,
    state.setRoutineForm,
  ]));
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);

  const user = useAuthStore((state) => state.user);
  const deleteRoutine = useDeleteRoutineMutation(user?.nickname || '');

  if (isLoading) {
    return null;
  }

  const handleDeleteRoutine = () => {
    Alert.alert('루틴 삭제', '삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: async () => {
          try {
            await deleteRoutine.mutateAsync(routineId);
            Alert.alert('삭제되었습니다.');
            router.push('/(tabs)/(afterLogin)/(routine)');
          } catch {
            Alert.alert('문제가 발생하였습니다.');
          }
        },
      },
    ]);
  };

  const handleMoveUpdate = () => {
    router.push('/modal?type=routine-update');

    if (detail) {
      setRoutineForm(detail);
    }
  };

  return (
    <ThemeView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemeView style={{ marginBottom: -20 }}>
          <ThemeText variant="subtitle" style={[styles.info, styles.infoLabel]}>
            {detail?.routineName}
          </ThemeText>
        </ThemeView>
        <ThemeView style={styles.content}>
          <ThemeText style={styles.info}>{detail?.routineDetail}</ThemeText>
        </ThemeView>

        <ThemeView style={styles.content}>
          <ThemeText variant="subtitle" style={[styles.info, styles.infoLabel]}>
            루틴 횟수
          </ThemeText>
          <ThemeText style={styles.info}>
            {detail?.weeklyCount || 0}/{detail?.routineCount}
          </ThemeText>
        </ThemeView>

        <ThemeView style={styles.content}>
          <ThemeText variant="subtitle" style={[styles.info, styles.infoLabel]}>
            벌금
          </ThemeText>
          <ThemeText style={styles.info}>
            {detail?.penalty.toLocaleString()}
          </ThemeText>
        </ThemeView>

        <ThemeView style={[styles.line, styles.content]}>
          <ThemeText variant="subtitle" style={[styles.info, styles.infoLabel]}>
            루틴 날짜
          </ThemeText>
          <ThemeText style={styles.info}>
            {detail?.startDate} ~ {detail?.endDate}
          </ThemeText>
        </ThemeView>

        <ThemeView style={styles.buttonContainer}>
          <Button
            title="수정"
            style={[styles.cancelButton, styles.button]}
            onPress={handleMoveUpdate}
          />
          <Button
            title="삭제"
            style={[styles.deleteButton, styles.button]}
            onPress={handleDeleteRoutine}
          />
        </ThemeView>
      </ScrollView>
    </ThemeView>
  );
};

export default RoutineDetailModal;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 30,
      paddingHorizontal: 10,
    },

    scroll: {
      gap: 20,
      paddingBottom: 50,
    },

    line: {
      flex: 1,
      paddingBottom: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS[colorScheme].grey,
    },

    infoLabel: {
      fontWeight: 'bold',
      marginBottom: 10,
    },

    info: {
      color: COLORS[colorScheme].text,
    },

    content: {
      marginBottom: 10,
    },

    routinesNameContainer: {
      position: 'relative',
    },

    routineDate: {
      position: 'absolute',
      top: 5,
      right: 0,
    },

    image: {
      width: '100%',
    },

    textarea: {
      height: 100,
    },

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

    deleteButton: {
      backgroundColor: COLORS.red,
    },
  });
