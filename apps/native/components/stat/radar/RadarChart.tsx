import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import type { UserStats } from '@repo/types';

import { STAT_CONFIGS, STAT_MAX_VALUE } from '@/constants/stats';

interface RadarChartProps {
  stats: UserStats;
  size?: number;
}

const getHexagonPoints = (
  centerX: number,
  centerY: number,
  radius: number,
): string => {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

const getStatPoints = (
  stats: UserStats,
  centerX: number,
  centerY: number,
  maxRadius: number,
): string => {
  const keys: (keyof UserStats)[] = [
    'strength',
    'agility',
    'intelligence',
    'luck',
    'vitality',
    'mana',
  ];

  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const statValue = stats[keys[i]] || 0;
    const ratio = Math.min(statValue / STAT_MAX_VALUE, 1);
    const radius = maxRadius * ratio;
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

export const RadarChart: React.FC<RadarChartProps> = ({
  stats,
  size = 200,
}) => {
  const { theme } = useUnistyles();
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size / 2 - 30;
  const labelRadius = maxRadius + 20;

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {gridLevels.map((level) => (
          <Polygon
            key={level}
            points={getHexagonPoints(centerX, centerY, maxRadius * level)}
            fill="none"
            stroke={theme.colors.border.subtle}
            strokeWidth={1}
          />
        ))}

        {STAT_CONFIGS.map((_, index) => {
          const angle = (Math.PI / 3) * index - Math.PI / 2;
          const x = centerX + maxRadius * Math.cos(angle);
          const y = centerY + maxRadius * Math.sin(angle);
          return (
            <Line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke={theme.colors.border.subtle}
              strokeWidth={1}
            />
          );
        })}

        <Polygon
          points={getStatPoints(stats, centerX, centerY, maxRadius)}
          fill="rgba(33, 150, 243, 0.3)"
          stroke={theme.colors.action.primary.default}
          strokeWidth={2}
        />

        {STAT_CONFIGS.map((config, index) => {
          const angle = (Math.PI / 3) * index - Math.PI / 2;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          return (
            <SvgText
              key={config.key}
              x={x}
              y={y}
              fill={config.color}
              fontSize={10}
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {config.abbr}
            </SvgText>
          );
        })}

        <Circle
          cx={centerX}
          cy={centerY}
          r={3}
          fill={theme.colors.text.primary}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});

export default RadarChart;
