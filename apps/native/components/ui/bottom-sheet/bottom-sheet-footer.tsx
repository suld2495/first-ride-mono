import type { ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StyleSheet, type AppThemes } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { baseFoundation } from '@/theme/tokens';

const BottomSheetFooter = ({ children, style, ...props }: ViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <ThemeView
      testID="bottom-sheet-footer"
      transparent
      style={[
        styles.footer,
        {
          paddingBottom: insets.bottom + baseFoundation.spacing[4],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </ThemeView>
  );
};

export default BottomSheetFooter;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  footer: {
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.foundation.spacing[4],
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: theme.colors.border.divider,
    paddingTop: theme.foundation.spacing[4],
  },
}));
