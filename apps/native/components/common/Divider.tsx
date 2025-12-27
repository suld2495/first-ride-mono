import React from 'react';
import { Text, View, type ViewProps, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

/**
 * Divider variant types
 * - subtle: 연한 구분선
 * - default: 기본 구분선
 * - emphasis: 강조 구분선
 */
export type DividerVariant = 'subtle' | 'default' | 'emphasis';

/**
 * Divider orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends Omit<ViewProps, 'style'> {
  /**
   * Divider variant (semantic token)
   * @default 'default'
   */
  variant?: DividerVariant;

  /**
   * Divider orientation
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;

  /**
   * Thickness in pixels
   * @default 1
   */
  thickness?: number;

  /**
   * Margin/spacing around divider
   * @default 0
   */
  spacing?: number;

  /**
   * Text to display in the center of the divider
   * Only works with horizontal orientation
   */
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'default',
  orientation = 'horizontal',
  thickness = 1,
  spacing = 0,
  text,
  ...props
}) => {
  styles.useVariants({
    variant,
  } as UnistylesVariants<typeof styles>);

  // 동적 스타일 (thickness와 spacing은 props로 받음)
  const lineStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          height: thickness,
          flex: text ? 1 : undefined,
          width: text ? undefined : '100%',
        }
      : {
          width: thickness,
          height: '100%',
        };

  // text가 있는 경우 컨테이너로 감싸서 렌더링
  if (text && orientation === 'horizontal') {
    return (
      <View
        style={[styles.textContainer, { marginVertical: spacing }]}
        {...props}
      >
        <View style={[styles.base, lineStyle]} />
        <Text style={styles.text}>{text}</Text>
        <View style={[styles.base, lineStyle]} />
      </View>
    );
  }

  // 기본 단순 divider
  const dynamicStyle: ViewStyle =
    orientation === 'horizontal'
      ? { ...lineStyle, marginVertical: spacing }
      : { ...lineStyle, marginHorizontal: spacing };

  return <View style={[styles.base, dynamicStyle]} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  base: {
    variants: {
      variant: {
        subtle: {
          backgroundColor: theme.colors.border.subtle,
        },
        default: {
          backgroundColor: theme.colors.border.default,
        },
        emphasis: {
          backgroundColor: theme.colors.border.strong,
        },
      },
    },
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    marginHorizontal: 12,
    fontSize: theme.foundation.typography.size.m,
    color: theme.colors.text.tertiary,
  },
}));

export default Divider;
