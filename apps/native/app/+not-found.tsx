import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';

import Container from '@/components/layout/container';
import { Typography } from '@/components/ui/typography';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Container>
        <Typography variant="title">{"This screen doesn't exist."}</Typography>
        <Link href="/" style={styles.link}>
          <Typography variant="body">Go to home screen!</Typography>
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
