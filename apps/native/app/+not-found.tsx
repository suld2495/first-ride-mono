import { StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';

import ThemeText from '@/components/common/ThemeText';
import Container from '@/components/layout/Container';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Container>
        <ThemeText variant="title">{"This screen doesn't exist."}</ThemeText>
        <Link href="/" style={styles.link}>
          <ThemeText variant="body">Go to home screen!</ThemeText>
        </Link>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 16,
    paddingTop: 16,
  },
});
