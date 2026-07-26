import { ScrollView, type ScrollViewProps } from 'react-native';

import { StyleSheet, type AppThemes } from '@/components/ui/tamagui';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';

const BottomSheetBody = ({
  children,
  style,
  contentContainerStyle,
  ...props
}: ScrollViewProps) => (
  <ScrollView
    testID="bottom-sheet-body"
    style={[styles.body, style]}
    contentContainerStyle={[styles.content, contentContainerStyle]}
    alwaysBounceVertical={false}
    showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
    {...props}
  >
    {children}
  </ScrollView>
);

export default BottomSheetBody;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  body: {
    flexShrink: 1,
    minHeight: 0,
  },
  content: {
    gap: theme.foundation.spacing[4],
  },
}));
