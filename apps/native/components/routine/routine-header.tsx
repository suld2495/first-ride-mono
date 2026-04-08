import { StyleSheet } from 'react-native-unistyles';

import Link from '@/components/ui/link';
import { PixelText } from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';

import RoutineDate from './routine-date';

interface RoutineHeaderProps {
  date: string;
}

const RoutineHeader = ({ date }: RoutineHeaderProps) => {
  return (
    <ThemeView style={styles.container} transparent>
      <ThemeView style={styles.header} transparent>
        <PixelText variant="title">루틴 리스트</PixelText>
        <Link
          href="/modal?type=routine-add"
          title="루틴 추가 +"
          style={styles.routineButton}
        />
      </ThemeView>
      <RoutineDate date={date} />
    </ThemeView>
  );
};

export default RoutineHeader;

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.foundation.spacing.l,
    marginTop: theme.foundation.spacing.m,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.foundation.spacing.m,
  },

  routineButton: {
    height: 36,
    paddingVertical: 0,
    borderRadius: theme.foundation.radii.s,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
}));
