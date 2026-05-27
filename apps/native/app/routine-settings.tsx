import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

export default function RoutineSettingsPage() {
  const router = useRouter();

  return (
    <Container noPadding>
      <PageHeader title="루틴 설정" showBackButton />
      <View testID="routine-settings-content" style={styles.content}>
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            router.push('/modal?type=hidden-routines');
          }}
          testID="routine-settings-hidden-routines-item"
          style={styles.menuItem}
        >
          <Typography
            color={palette.theme.gray[60]}
            variant="body2"
            weight="semibold"
          >
            숨긴 루틴 모아보기
          </Typography>
        </Pressable>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    paddingTop: theme.foundation.spacing[3],
  },
  menuItem: {
    height: baseFoundation.dimension.x44,
    justifyContent: 'center',
    paddingLeft: theme.foundation.spacing[6],
  },
}));
