import { StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';

import { Typography } from '@/components/common/Typography';
import Container from '@/components/layout/Container';

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
