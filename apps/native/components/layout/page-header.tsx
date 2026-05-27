import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { PageHeaderBackIcon } from '@/components/icons/navigation-icons';
import IconButton from '@/components/ui/icon-button';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import Typography from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

interface PageHeaderProps {
  title?: string;
  center?: ReactNode;
  right?: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const PageHeader = ({
  title,
  center,
  right,
  showBackButton = false,
  onBackPress,
  backAccessibilityLabel = '뒤로가기',
  style,
}: PageHeaderProps) => {
  const { theme } = useAppTheme();
  const router = useRouter();
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  };

  return (
    <ThemeView style={[styles.container, style]} transparent>
      {showBackButton ? (
        <View style={styles.left}>
          <IconButton
            size="sm"
            variant="ghost"
            onPress={handleBackPress}
            accessibilityLabel={backAccessibilityLabel}
            accessibilityRole="button"
            style={styles.backButton}
            icon={() => <PageHeaderBackIcon color={theme.colors.text.gray} />}
          />
        </View>
      ) : null}

      <View style={styles.center} pointerEvents="box-none">
        {center ?? (
          <Typography variant="body1" weight="semibold" style={styles.title}>
            {title}
          </Typography>
        )}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </ThemeView>
  );
};

export default PageHeader;

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.foundation.spacing[2],
    paddingHorizontal: theme.foundation.spacing[4],
    height: baseFoundation.dimension.x44,
  },
  left: {
    position: 'absolute',
    left: theme.foundation.spacing[4],
    top: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    justifyContent: 'center',
    zIndex: 1,
  },
  backButton: {
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    minWidth: baseFoundation.dimension.x24,
    minHeight: baseFoundation.dimension.x24,
  },
  center: {
    position: 'absolute',
    top: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    left: baseFoundation.spacing[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    left: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    textAlign: 'center',
    color: theme.colors.text.pageHeaderTitle,
  },
  right: {
    position: 'absolute',
    right: theme.foundation.spacing[4],
    top: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    justifyContent: 'center',
    zIndex: 1,
  },
}));
