import { StyleSheet } from 'react-native-unistyles';

import Link from '../common/Link';
import PixelText from '../common/PixelText';
import ThemeView from '../common/ThemeView';

import RoutineDate from './RoutineDate';

interface RoutineHeaderProps {
  date: string;
}

const RoutineHeader = ({ date }: RoutineHeaderProps) => {
  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.header}>
        <PixelText variant="title">루틴 리스트</PixelText>
        <Link
          href="/modal?type=routine-add"
          title="루틴 추가 +"
          style={styles.routine_add_button}
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
  },

  routine_add_button: {
    height: 35,
    paddingVertical: 0,
    borderRadius: 4,
    borderWidth: 2,
  },
}));
