import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import Typography from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

interface PageHeaderProps {
  title?: string;
  center?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const PageHeader = ({ title, center, right, style }: PageHeaderProps) => {
  return (
    <ThemeView style={[styles.container, style]} transparent>
      <View style={styles.center}>
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
    minHeight: baseFoundation.dimension.x44,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text.title,
  },
  right: {
    position: 'absolute',
    right: theme.foundation.spacing[4],
    top: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    justifyContent: 'center',
  },
}));
