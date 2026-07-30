import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

const TERMS_ITEMS = [
  { title: '이용약관', href: '/modal?type=policies' },
  { title: '개인정보 처리방침', href: '/modal?type=privacy' },
] as const;

const TermsPage = () => {
  const router = useRouter();

  return (
    <Container noPadding style={styles.container}>
      <PageHeader title="약관" showBackButton />
      <View style={styles.menuList} testID="terms-menu-list">
        {TERMS_ITEMS.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.title}
            onPress={() => router.push(item.href)}
            style={styles.menuItem}
            testID={`terms-menu-item-${item.title}`}
          >
            <Typography
              color={palette.theme.gray[60]}
              testID={`terms-menu-text-${item.title}`}
              variant="body2"
              weight="semibold"
            >
              {item.title}
            </Typography>
          </Pressable>
        ))}
      </View>
    </Container>
  );
};

export default TermsPage;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.base,
  },
  menuList: {
    paddingTop: theme.foundation.spacing[3],
  },
  menuItem: {
    height: baseFoundation.dimension.x44,
    paddingLeft: theme.foundation.spacing[6],
    paddingRight: theme.foundation.spacing[6],
    justifyContent: 'center',
  },
}));
