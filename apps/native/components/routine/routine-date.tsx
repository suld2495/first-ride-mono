import Ionicons from '@expo/vector-icons/Ionicons';
import {
  afterWeek,
  beforeWeek,
  getDisplayFormatDate,
  getWeekMonday,
  getWeekSunday,
} from '@repo/shared/utils';
import { StyleSheet } from 'react-native-unistyles';

import { IconButton } from '@/components/ui/icon-button';
import Link from '@/components/ui/link';
import PixelText from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';
import { useRoutineType, useSetRoutineType } from '@/hooks/useRoutineSelection';

interface RoutineDateProps {
  date?: string;
}

const RoutineDate = ({ date }: RoutineDateProps) => {
  const startDate = new Date(getWeekMonday(date ? new Date(date) : new Date()));
  const endDate = new Date(getWeekSunday(startDate));

  const type = useRoutineType();
  const setType = useSetRoutineType();

  return (
    <ThemeView style={styles.date_container}>
      <ThemeView style={styles.currentDate}>
        <PixelText variant="label">{getDisplayFormatDate(startDate)}</PixelText>
        <PixelText variant="label">~</PixelText>
        <PixelText variant="label">{getDisplayFormatDate(endDate)}</PixelText>
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
    paddingHorizontal: theme.foundation.spacing.m,
  },

  currentDate: {
    flexDirection: 'row',
    gap: theme.foundation.spacing.xs,
  },

  right: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  date_button_container: {
    flexDirection: 'row',
    gap: theme.foundation.spacing.xs,
  },

  link: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  line: {
    width: 2,
    height: 17,
    backgroundColor: theme.colors.border.default,
    marginInline: theme.foundation.spacing.xs,
  },

  icons: {
    flexDirection: 'row',
    gap: theme.foundation.spacing.xs,
  },
}));
