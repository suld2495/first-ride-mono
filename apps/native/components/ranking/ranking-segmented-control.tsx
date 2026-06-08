import { Pressable, Text, View } from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';

export interface RankingSegmentOption<T extends string> {
  label: string;
  value: T;
}

interface RankingSegmentedControlProps<T extends string> {
  options: readonly RankingSegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const RankingSegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: RankingSegmentedControlProps<T>) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected ? styles.selectedOption : null]}
          >
            <Text
              style={[styles.label, selected ? styles.selectedLabel : null]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default RankingSegmentedControl;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[1],
    padding: theme.foundation.spacing[1],
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.sunken,
  },
  option: {
    flex: 1,
    minHeight: theme.foundation.dimension.x36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.foundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[2],
  },
  selectedOption: {
    backgroundColor: theme.colors.brand.text,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: theme.foundation.typography.size.body3,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
}));
