import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  afterWeek,
  beforeWeek,
  getDisplayFormatDate,
  getWeekMonday,
  getWeekSunday,
} from '@repo/shared/utils';
import { useShallow } from 'zustand/shallow';

import { useRoutineStore } from '@/store/routine.store';

import { IconButton } from '../common/IconButton';
import Link from '../common/Link';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface RoutineDateProps {
  date?: string;
}

const RoutineDate = ({ date }: RoutineDateProps) => {
  const startDate = new Date(getWeekMonday(date ? new Date(date) : new Date()));
  const endDate = new Date(getWeekSunday(startDate));

  const [type, setType] = useRoutineStore(
    useShallow((state) => [state.type, state.setType]),
  );

  return (
    <ThemeView style={styles.date_container}>
      <ThemeView style={styles.currentDate}>
        <Typography variant="body">
          {getDisplayFormatDate(startDate)}
        </Typography>
        <Typography variant="body">~</Typography>
        <Typography variant="body">{getDisplayFormatDate(endDate)}</Typography>
      </ThemeView>
      <ThemeView style={styles.right}>
        <ThemeView style={styles.date_button_container}>
          <Link
            variant="ghost"
            href={`/(tabs)/(afterLogin)/(routine)?date=${beforeWeek(startDate)}`}
            leftIcon={({ color }) => (
              <Ionicons name="chevron-back" size={24} color={color} />
            )}
            style={styles.link}
            accessibilityLabel="이전 주"
            accessibilityRole="button"
          />
          <Link
            variant="ghost"
            href={`/(tabs)/(afterLogin)/(routine)?date=${afterWeek(startDate)}`}
            leftIcon={({ color }) => (
              <Ionicons name="chevron-forward" size={24} color={color} />
            )}
            style={styles.link}
            accessibilityLabel="다음 주"
            accessibilityRole="button"
          />
        </ThemeView>
        <ThemeView style={styles.line} />
        <ThemeView style={styles.icons}>
          {type === 'number' ? (
            <>
              <IconButton
                icon={({ color }) => (
                  <Ionicons name="keypad-sharp" size={22} color={color} />
                )}
                variant="ghost"
                onPress={() => setType('number')}
                accessibilityLabel="회차별 보기"
                accessibilityRole="button"
                accessibilityState={{ selected: true }}
              />
              <IconButton
                icon={({ color }) => (
                  <Ionicons name="grid-outline" size={22} color={color} />
                )}
                variant="ghost"
                onPress={() => setType('week')}
                accessibilityLabel="요일별 보기"
                accessibilityRole="button"
                accessibilityState={{ selected: false }}
              />
            </>
          ) : (
            <>
              <IconButton
                icon={({ color }) => (
                  <Ionicons name="keypad-outline" size={22} color={color} />
                )}
                variant="ghost"
                onPress={() => setType('number')}
                accessibilityLabel="회차별 보기"
                accessibilityRole="button"
                accessibilityState={{ selected: false }}
              />
              <IconButton
                icon={({ color }) => (
                  <Ionicons name="grid" size={22} color={color} />
                )}
                variant="ghost"
                onPress={() => setType('week')}
                accessibilityLabel="요일별 보기"
                accessibilityRole="button"
                accessibilityState={{ selected: true }}
              />
            </>
          )}
        </ThemeView>
      </ThemeView>
    </ThemeView>
  );
};

export default RoutineDate;

const styles = StyleSheet.create((theme) => ({
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
    backgroundColor: theme.colors.border.default,
    marginInline: 5,
  },

  icons: {
    flexDirection: 'row',
    gap: 5,
  },
}));
