import React from 'react';
import type { ViewProps } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { BottomSheetDragContext } from '@/components/ui/bottom-sheet/bottom-sheet-drag-context';
import { StyleSheet, type AppThemes } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { baseFoundation } from '@/theme/tokens';

const BottomSheetHeader = ({ children, style, ...props }: ViewProps) => {
  const dragGesture = React.useContext(BottomSheetDragContext);
  const handle = (
    <ThemeView
      testID="bottom-sheet-drag-handle"
      collapsable={false}
      transparent
      style={styles.handleTouchArea}
    >
      <ThemeView transparent style={styles.handle} />
    </ThemeView>
  );

  return (
    <ThemeView
      testID="bottom-sheet-header"
      transparent
      style={[styles.header, style]}
      {...props}
    >
      {dragGesture ? (
        <GestureDetector gesture={dragGesture}>{handle}</GestureDetector>
      ) : (
        handle
      )}
      {children}
    </ThemeView>
  );
};

export default BottomSheetHeader;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  header: {
    flexShrink: 0,
    gap: theme.foundation.spacing[2],
  },
  handleTouchArea: {
    height: baseFoundation.dimension.x28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: baseFoundation.dimension.x44,
    height: baseFoundation.dimension.x5,
    borderRadius: theme.foundation.radii.round,
    backgroundColor: theme.colors.border.strong,
    opacity: 0.7,
  },
}));
