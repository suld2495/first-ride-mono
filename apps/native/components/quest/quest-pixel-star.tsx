import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';

type QuestPixelStarProps = {
  size: number;
};

const STAR_PATTERN = [
  '.....S.....',
  '....SHS....',
  '....SFS....',
  '...SFFFS...',
  'SSSFFFFSSS',
  '.SFFFFFFFS.',
  '..SFFFFFS..',
  '...SFFFS...',
  '..SFS.SFS..',
  '.SFS...SFS.',
  'SSS.....SSS',
] as const;

const PIXEL_GRID_SIZE = STAR_PATTERN.length;

const QuestPixelStar = ({ size }: QuestPixelStarProps) => {
  const { theme } = useAppTheme();
  const pixelSize = size / PIXEL_GRID_SIZE;
  const pixelColors = useMemo(
    () => ({
      F: theme.colors.brand.primary,
      H: theme.colors.brand.secondary,
      S: theme.colors.brand.text,
    }),
    [
      theme.colors.brand.primary,
      theme.colors.brand.secondary,
      theme.colors.brand.text,
    ],
  );

  return (
    <View
      style={[styles.star, { width: size, height: size }]}
      testID="quest-pixel-star"
    >
      {STAR_PATTERN.flatMap((row, rowIndex) =>
        [...row].map((cell, columnIndex) => {
          if (cell === '.') {
            return null;
          }

          const colorKey = cell as keyof typeof pixelColors;

          return (
            <View
              key={`${rowIndex}-${columnIndex}`}
              style={[
                styles.pixel,
                {
                  width: pixelSize,
                  height: pixelSize,
                  left: columnIndex * pixelSize,
                  top: rowIndex * pixelSize,
                  backgroundColor: pixelColors[colorKey],
                },
              ]}
              testID={`quest-pixel-star-${colorKey}`}
            />
          );
        }),
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  star: {
    position: 'relative',
  },
  pixel: {
    position: 'absolute',
    borderRadius: 0,
  },
});

export default memo(QuestPixelStar);
