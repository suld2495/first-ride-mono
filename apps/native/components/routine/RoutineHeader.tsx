import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { getWeekMonday } from '@/utils/date-utils';

import Link from '../common/Link';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

import RoutineDate from './RoutineDate';

const RoutineHeader = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const currentDate = date || getWeekMonday(new Date());

  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.header}>
        <ThemeText variant="title">루틴 리스트</ThemeText>
        <Link
          href="/modal?type=routine-add"
          title="루틴 추가 +"
          style={styles.routine_add_button}
          fontSize="body"
        />
      </ThemeView>
      <RoutineDate date={currentDate} />
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
