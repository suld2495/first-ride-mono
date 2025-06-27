import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';
import {
  afterWeek,
  beforeWeek,
  getDisplayFormatDate,
  getWeekMonday,
  getWeekSunday,
} from '@/utils/date-utils';

import Link from '../common/Link';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

interface RoutineDateProps {
  date?: string;
}

const RoutineDate = ({ date }: RoutineDateProps) => {
  const colorScheme = useColorScheme();
  const startDate = new Date(getWeekMonday(date ? new Date(date) : new Date()));
  const endDate = new Date(getWeekSunday(startDate));

  return (
    <ThemeView style={styles.date_container}>
      <ThemeView style={styles.currentDate}>
        <ThemeText variant="body">
          {getDisplayFormatDate(startDate, false)}
        </ThemeText>
        <ThemeText variant="body">~</ThemeText>
        <ThemeText variant="body">
          {getDisplayFormatDate(endDate, false)}
        </ThemeText>
      </ThemeView>
      <ThemeView style={styles.date_button_container}>
        <Link
          variant="plain"
          href={`/(tabs)/(afterLogin)/(routine)?date=${beforeWeek(startDate)}`}
          icon={
            <Ionicons
              name="chevron-back"
              size={24}
              color={COLORS[colorScheme].icon}
            />
          }
          style={styles.link}
        />
        <Link
          variant="plain"
          href={`/(tabs)/(afterLogin)/(routine)?date=${afterWeek(startDate)}`}
          icon={
            <Ionicons
              name="chevron-forward"
              size={24}
              color={COLORS[colorScheme].icon}
            />
          }
          style={styles.link}
        />
      </ThemeView>
    </ThemeView>
  );
};

export default RoutineDate;

const styles = StyleSheet.create({
  date_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  currentDate: {
    flexDirection: 'row',
    gap: 5,
  },

  date_button_container: {
    flexDirection: 'row',
    gap: 3,
  },

  link: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
