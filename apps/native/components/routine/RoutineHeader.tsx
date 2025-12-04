import { StyleSheet } from 'react-native-unistyles';

import Link from '../common/Link';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

import RoutineDate from './RoutineDate';

interface RoutineHeaderProps {
  date: string;
}

const RoutineHeader = ({ date }: RoutineHeaderProps) => {
  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.header}>
        <Typography variant="title">루틴 리스트</Typography>
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

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 19,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  routine_add_button: {
    height: 35,
    paddingVertical: 0,
    borderRadius: 5,
  },
});
