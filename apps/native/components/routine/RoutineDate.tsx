import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  afterWeek,
  beforeWeek,
  getDisplayFormatDate,
  getWeekMonday,
  getWeekSunday,
} from '@repo/shared/utils';
import { useShallow } from 'zustand/shallow';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';

import Link from '../common/Link';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';
import { useRoutineStore } from '@/store/routine.store';
import Button from '../common/Button';

interface RoutineDateProps {
  date?: string;
}

const RoutineDate = ({ date }: RoutineDateProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme)
  
  const startDate = new Date(getWeekMonday(date ? new Date(date) : new Date()));
  const endDate = new Date(getWeekSunday(startDate));

  const [type, setType] = useRoutineStore(
    useShallow((state) => [state.type, state.setType]),
  );

  return (
    <ThemeView style={styles.date_container}>
      <ThemeView style={styles.currentDate}>
        <ThemeText variant="body">
          {getDisplayFormatDate(startDate)}
        </ThemeText>
        <ThemeText variant="body">~</ThemeText>
        <ThemeText variant="body">
          {getDisplayFormatDate(endDate)}
        </ThemeText>
      </ThemeView>
      <ThemeView style={styles.right}>
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
        <ThemeView style={styles.line}></ThemeView>
        <ThemeView style={styles.icons}>
          {type === 'number' ? (
            <>
              <Button
                icon={<Ionicons
                  name="keypad-sharp"
                  size={22}
                  color={COLORS[colorScheme].icon}
                />}
                variant='plain'
                onPress={() => setType('number')}
                style={styles.icon}
              />
              <Button
                icon={<Ionicons
                  name="grid-outline"
                  size={22}
                  color={COLORS[colorScheme].icon}
                />}
                variant='plain'
                onPress={() => setType('week')}
                style={styles.icon}
              />
            </>
          ) : (
            <>
              <Button
                icon={<Ionicons
                  name="keypad-outline"
                  size={22}
                  color={COLORS[colorScheme].icon}
                />}
                variant='plain'
                onPress={() => setType('number')}
                style={styles.icon}
              />
              <Button
                icon={<Ionicons
                  name="grid"
                  size={22}
                  color={COLORS[colorScheme].icon}
                />}
                variant='plain'
                onPress={() => setType('week')}
                style={styles.icon}
              />
            </>
          )}
        </ThemeView>
      </ThemeView>
    </ThemeView>
  );
};

export default RoutineDate;

const createStyles = (colorScheme: 'light' | 'dark') => (
  StyleSheet.create({
    date_container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  
    currentDate: {
      flexDirection: 'row',
      gap: 5,
    },
  
    right: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },

    date_button_container: {
      flexDirection: 'row',
      gap: 3,
    },
  
    link: {
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
  
    line: {
      width: 1,
      height: 17,
      backgroundColor: COLORS[colorScheme].icon,
      marginInline: 5,
    },

    icons: {
      flexDirection: 'row',
      gap: 5,
    },

    icon: {
      paddingVertical: 0,
      paddingHorizontal: 0,
    }
  })  
);