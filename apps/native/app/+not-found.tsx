import { Link, Stack } from 'expo-router';

import Container from '@/components/layout/container';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Container>
        <Typography variant="title" weight="semibold">
          {"This screen doesn't exist."}
        </Typography>
        <Link href="/" style={styles.link}>
          <Typography variant="body">Go to home screen!</Typography>
        </Link>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: baseFoundation.spacing[4],
    paddingTop: baseFoundation.spacing[4],
  },
});
