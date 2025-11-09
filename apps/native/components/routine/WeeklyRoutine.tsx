import { Pressable, StyleSheet, View, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Routine, WeeklyRoutine } from '@repo/types';
import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeView, { ThemedViewProps } from '../common/ThemeView';
import { getDaysOfTheWeek, getWeekMonday } from '@repo/shared/utils';
import { useWeeklyData } from '@repo/shared/hooks/useRoutine';

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

interface RoutineListProps {
  date: string;
  onShowRequestModal: (id: number) => void;
  onShowDetailModal: (id: number) => void;
}


type RoutineWrapperProps = RoutineListProps & {
  routines: WeeklyRoutine[] | Routine[];
  render: (routine: WeeklyRoutine | Routine) => React.ReactNode;
}

const RoutineWrapper = ({ routines, date, onShowRequestModal, onShowDetailModal, render }: RoutineWrapperProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <FlatList
      data={routines}
      renderItem={({ item: routine, index }) => {
        const isLast = (index === routines.length - 1);

        return (
          <ThemeView style={[styles.container, !isLast && styles.borderBottom]}>
            <ThemeView style={styles.info}>
              <ThemeView>
                <Pressable onPress={() => onShowDetailModal(routine.routineId)}>
                  <ThemeText style={styles.title}>{routine.routineName}</ThemeText>
                </Pressable>
              </ThemeView>
              <ThemeView>
                {date === getWeekMonday(new Date()) && (
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
                    onPress={() => onShowRequestModal(routine.routineId)}
                  />
                )}
              </ThemeView>
            </ThemeView>
            {render(routine)}
          </ThemeView>
        )
      }}
      keyExtractor={(item) => item.routineId.toString()}
      contentContainerStyle={styles.list}
    />
  )
};

export const RoutineWeekList = (props: RoutineListProps & { routines: WeeklyRoutine[] }) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const { routines } = props;
  const weeklyData = useWeeklyData(routines);

  return (
    <RoutineWrapper
      {...props}
      render={({ routineId, weeklyCount, routineCount }) => {
        let count = 0;

        return (
          <ThemeView style={styles.table}>
            <ThemeView style={[styles.row, styles.header]}>
              {getDaysOfTheWeek().map((day) => (
                <WeekyView
                  key={day}
                  text={day}
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
              {weeklyData[routineId].map((check, index) => {
                count += +check;

                return (
                  check ? (
                    <WeekyView key={index} style={styles.column}>
                      <Ionicons
                        name="checkbox"
                        size={24}
                        color={count <= routineCount ? COLORS[colorScheme].button : COLORS.checkPoint}
                      />
                    </WeekyView>
                  ) : (
                    <WeekyView key={index} style={styles.column}>
                      <Ionicons
                        name="square-outline"
                        size={24}
                        color={COLORS[colorScheme].icon}
                      />
                    </WeekyView>
                  )
                )
              })}
              <View style={styles.success_rate}>
                {weeklyCount >= routineCount ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS[colorScheme].buttonLight}
                  />
                ) : (
                  <ThemeText variant="body">
                    {routineCount > 0 ? `${Math.round((weeklyCount / routineCount) * 100)}%` : '0%'}
                  </ThemeText>
                )}
              </View>
            </ThemeView>
          </ThemeView>
        )
      }}
    />
  );
};

export const RoutineCountList = (props: RoutineListProps & { routines: Routine[] }) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <RoutineWrapper
      {...props}
      render={({ weeklyCount, routineCount }) => (
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
            {Array(Math.min(~~weeklyCount, routineCount))
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

            {Array(Math.max(~~weeklyCount - routineCount, 0))
              .fill(0)
              .map((_, index) => (
                <WeekyView key={index} style={styles.column}>
                  <Ionicons
                    name="checkbox"
                    size={24}
                    color={COLORS.checkPoint}
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
              {weeklyCount >= routineCount ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS[colorScheme].buttonLight}
                />
              ) : (
                <ThemeText variant="body">
                  {routineCount > 0 ? `${Math.round((weeklyCount / routineCount) * 100)}%` : '0%'}
                </ThemeText>
              )}
            </View>
          </ThemeView>
        </ThemeView>
      )}
    />
  );
};

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    list: {
      gap: 15,
    },

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
