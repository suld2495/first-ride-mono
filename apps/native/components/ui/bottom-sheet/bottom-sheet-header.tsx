import type { ViewProps } from 'react-native';

import { StyleSheet, type AppThemes } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { baseFoundation } from '@/theme/tokens';

const BottomSheetHeader = ({ children, style, ...props }: ViewProps) => (
  <ThemeView
    testID="bottom-sheet-header"
    transparent
    style={[styles.header, style]}
    {...props}
  >
    <ThemeView transparent style={styles.handle} />
    {children}
  </ThemeView>
);

export default BottomSheetHeader;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  header: {
    flexShrink: 0,
    gap: theme.foundation.spacing[2],
  },
  handle: {
    alignSelf: 'center',
    width: baseFoundation.dimension.x44,
    height: baseFoundation.dimension.x5,
    borderRadius: theme.foundation.radii.round,
    backgroundColor: theme.colors.border.strong,
    opacity: 0.7,
  },
}));
