import { StyleSheet } from 'react-native';

import { Container } from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import RoutineHeader from '@/components/routine/RoutineHeader';
import RoutineList from '@/components/routine/RoutineList';

export default function Index() {
  return (
    <Container style={styles.container}>
      <Header />
      <RoutineHeader />
      <RoutineList />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    flex: 1,
  },
});
