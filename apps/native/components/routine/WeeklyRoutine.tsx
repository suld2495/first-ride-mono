import { FlatList, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  actionColors,
  contentColors,
  feedbackColors,
} from '@repo/design-system';
import { useWeeklyData } from '@repo/shared/hooks/useRoutine';
import { getDaysOfTheWeek, getWeekMonday } from '@repo/shared/utils';
import { Routine, WeeklyRoutine } from '@repo/types';

import { useColorScheme } from '@/hooks/useColorScheme';

import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Divider } from '../common/Divider';
import ThemeView, { ThemedViewProps } from '../common/ThemeView';
import { Typography } from '../common/Typography';

const WeekyView = (props: ThemedViewProps & { text?: string }) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <ThemeView {...props} transparent>
      {props.text ? (
        <Typography style={styles.view_text}>{props.text}</Typography>
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
};

const RoutineWrapper = ({
  routines,
  date,
  onShowRequestModal,
  onShowDetailModal,
  render,
}: RoutineWrapperProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <FlatList
      data={routines}
      renderItem={({ item: routine, index }) => {
        const isLast = index === routines.length - 1;

        return (
          <ThemeView style={styles.container}>
            <ThemeView style={styles.info}>
              <ThemeView>
                <Button
                  variant="ghost"
                  onPress={() => onShowDetailModal(routine.routineId)}
                  style={{ padding: 0 }}
                >
                  <Typography style={styles.title}>
                    {routine.routineName}
                  </Typography>
                </Button>
              </ThemeView>
              <ThemeView>
                {date === getWeekMonday(new Date()) && (
                  <Button
                    title="인증 요청"
                    style={styles.complete_button}
                    leftIcon={({ color }) => (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={color}
                      />
                    )}
                    onPress={() => onShowRequestModal(routine.routineId)}
                  />
                )}
              </ThemeView>
            </ThemeView>
            {render(routine)}
            {!isLast && <Divider />}
          </ThemeView>
        );
      }}
      keyExtractor={(item) => item.routineId.toString()}
      contentContainerStyle={styles.list}
    />
  );
};

export const RoutineWeekList = (
  props: RoutineListProps & { routines: WeeklyRoutine[] },
) => {
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
          <Card variant="raised" padding="lg" style={styles.table}>
            <ThemeView style={styles.row}>
              {getDaysOfTheWeek().map((day) => (
                <WeekyView key={day} text={day} style={styles.column} />
              ))}
              <ThemeView style={styles.success_rate}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={contentColors.disabled[colorScheme]}
                  style={styles.success_rate_icon}
                />
              </ThemeView>
            </ThemeView>
            <Divider spacing={8} />
            <ThemeView style={styles.row} transparent>
              {weeklyData[routineId].map((check, index) => {
                count += +check;

                return check ? (
                  <WeekyView key={index} style={styles.column}>
                    <Ionicons
                      name="checkbox"
                      size={24}
                      color={
                        count <= routineCount
                          ? actionColors.primary[colorScheme]
                          : feedbackColors.warning.icon[colorScheme]
                      }
                    />
                  </WeekyView>
                ) : (
                  <WeekyView key={index} style={styles.column}>
                    <Ionicons
                      name="square-outline"
                      size={24}
                      color={contentColors.muted[colorScheme]}
                    />
                  </WeekyView>
                );
              })}
              <ThemeView style={styles.success_rate} transparent>
                {weeklyCount >= routineCount ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={feedbackColors.success.icon[colorScheme]}
                  />
                ) : (
                  <Typography variant="body">
                    {routineCount > 0
                      ? `${Math.round((weeklyCount / routineCount) * 100)}%`
                      : '0%'}
                  </Typography>
                )}
              </ThemeView>
            </ThemeView>
          </Card>
        );
      }}
    />
  );
};

export const RoutineCountList = (
  props: RoutineListProps & { routines: Routine[] },
) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <RoutineWrapper
      {...props}
      render={({ weeklyCount, routineCount }) => (
        <ThemeView style={styles.table} transparent>
          <ThemeView style={styles.row} transparent>
            {Array(7)
              .fill(0)
              .map((_, index) => (
                <WeekyView
                  key={index}
                  text={`${index + 1}회`}
                  style={styles.column}
                />
              ))}
            <ThemeView style={styles.success_rate} transparent>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={feedbackColors.success.icon[colorScheme]}
                style={styles.success_rate_icon}
              />
            </ThemeView>
          </ThemeView>
          <ThemeView style={styles.row}>
            {Array(Math.min(~~weeklyCount, routineCount))
              .fill(0)
              .map((_, index) => (
                <WeekyView key={index} style={styles.column}>
                  <Ionicons
                    name="checkbox"
                    size={24}
                    color={actionColors.primary[colorScheme]}
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
                    color={feedbackColors.warning.icon[colorScheme]}
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
                    color={contentColors.muted[colorScheme]}
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
                    color={contentColors.disabled[colorScheme]}
                  />
                </WeekyView>
              ))}
            <ThemeView style={styles.success_rate} transparent>
              {weeklyCount >= routineCount ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={feedbackColors.success.icon[colorScheme]}
                />
              ) : (
                <Typography variant="body">
                  {routineCount > 0
                    ? `${Math.round((weeklyCount / routineCount) * 100)}%`
                    : '0%'}
                </Typography>
              )}
            </ThemeView>
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

    info: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    table: {
      gap: 5,
      marginTop: 10,
    },

    row: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      justifyContent: 'space-between',
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
      color: contentColors.body[colorScheme],
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
