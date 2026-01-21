import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export interface PixelProgressBarProps {
  value: number;
  maxValue: number;
  color?: string;
  height?: number;
  showBorder?: boolean;
}

export const PixelProgressBar: React.FC<PixelProgressBarProps> = ({
  value,
  maxValue,
  color,
  height = 12,
  showBorder = true,
}) => {
  const { theme } = useUnistyles();
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  const fillColor = color || theme.colors.action.primary.default;

  return (
    <View style={[styles.container, showBorder && styles.border, { height }]}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
        <View style={[styles.fillHighlight, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.sunken,
  },
  border: {
    borderWidth: 2,
    borderColor: theme.colors.border.strong,
  },
  track: {
    flex: 1,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  fillHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

export default PixelProgressBar;
