import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';

import { Routine } from '@/api/routine.api';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRoutineStore } from '@/store/routine.store';
import { COLORS } from '@/theme/colors';

import { Button } from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeView, { ThemedViewProps } from '../common/ThemeView';

const WeekyView = (props: ThemedViewProps & { text?: string }) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <ThemeView
      {...props}
      lightColor={COLORS.light.backgroundGrey}
      darkColor={COLORS.dark.backgroundGrey}
    >
      {props.text ? (
        <ThemeText style={styles.view_text}>{props.text}</ThemeText>
      ) : (
        props.children
      )}
    </ThemeView>
  );
};

const WeeklyRoutine = ({
  routineId,
  routineName,
  weeklyCount,
  routineCount,
  isLast,
}: Routine & { isLast?: boolean }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const setRoutineId = useRoutineStore((state) => state.setRoutineId);

  const handleRequestModal = () => {
    router.push('/modal?type=request');
    setRoutineId(routineId);
  };

  const handleRoutineDetailModal = () => {
    router.push('/modal?type=routine-detail');
    setRoutineId(routineId);
  };

  return (
    <ThemeView style={[styles.container, !isLast && styles.borderBottom]}>
      <ThemeView style={styles.info}>
        <ThemeView>
          <Pressable onPress={handleRoutineDetailModal}>
            <ThemeText style={styles.title}>{routineName}</ThemeText>
          </Pressable>
        </ThemeView>
        <ThemeView>
          <Button
            title="인증 요청"
            fontSize="caption"
            style={styles.complete_button}
            icon={
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS[colorScheme].buttonLight}
              />
            }
            onPress={handleRequestModal}
          />
        </ThemeView>
      </ThemeView>

      <ThemeView style={styles.table}>
        <ThemeView style={[styles.row, styles.header]}>
          {Array(7)
            .fill(0)
            .map((_, index) => (
              <WeekyView
                key={index}
                text={`${index + 1}회`}
                style={styles.column}
              />
            ))}
          <View style={styles.success_rate}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS[colorScheme].buttonLight}
              style={styles.success_rate_icon}
            />
          </View>
        </ThemeView>
        <ThemeView style={styles.row}>
          {Array(~~weeklyCount)
            .fill(0)
            .map((_, index) => (
              <WeekyView key={index} style={styles.column}>
                <Ionicons
                  name="checkbox"
                  size={24}
                  color={COLORS[colorScheme].button}
                />
              </WeekyView>
            ))}

          {Array(Math.max(routineCount - ~~weeklyCount, 0))
            .fill(0)
            .map((_, index) => (
              <WeekyView key={index} style={styles.column}>
                <Ionicons
                  name="square-outline"
                  size={24}
                  color={COLORS[colorScheme].icon}
                />
              </WeekyView>
            ))}

          {Array(7 - Math.max(routineCount, ~~weeklyCount))
            .fill(0)
            .map((_, index) => (
              <WeekyView key={index} style={styles.column}>
                <Ionicons
                  name="remove-outline"
                  size={24}
                  color={COLORS[colorScheme].icon}
                />
              </WeekyView>
            ))}
          <View style={styles.success_rate}>
            <ThemeText variant="body">
              {weeklyCount
                ? `${Math.round((weeklyCount / routineCount) * 100)}%`
                : '0%'}
            </ThemeText>
          </View>
        </ThemeView>
      </ThemeView>
    </ThemeView>
  );
};

export default WeeklyRoutine;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      gap: 10,
    },

    borderBottom: {
      paddingBottom: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS[colorScheme].backgroundGrey,
    },

    info: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    table: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
      borderRadius: 10,
      padding: 20,
      paddingBottom: 30,
      gap: 5,
      marginTop: 10,
    },

    row: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      justifyContent: 'space-between',
    },

    header: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS[colorScheme].grey,
      paddingBottom: 16,
      marginBottom: 15,
    },

    column: {
      flexDirection: 'row',
      justifyContent: 'center',
      flex: 1,
    },

    title: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    view_text: {
      color: COLORS[colorScheme].text,
    },

    complete_button: {
      height: 30,
      paddingVertical: 0,
      paddingHorizontal: 10,
      borderRadius: 5,
    },

    success_rate: {
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },

    success_rate_icon: {
      borderColor: 'red',
      borderRadius: 100,
    },

    empty_checkbox: {
      opacity: 0.7,
    },
  });
