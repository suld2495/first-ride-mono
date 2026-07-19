import type { AppleGender } from '@repo/types';
import { Pressable, View } from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { palette } from '@/theme/tokens';

interface GenderSelectorProps {
  value: AppleGender | '';
  onSelect: (gender: AppleGender) => void;
  error?: boolean;
  helperText?: string;
}

const OPTIONS: Array<{ label: string; value: AppleGender }> = [
  { label: '남성', value: 'MALE' },
  { label: '여성', value: 'FEMALE' },
];

export function GenderSelector({
  value,
  onSelect,
  error = false,
  helperText,
}: GenderSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityLabel={`${option.label} 선택`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.value)}
              style={[
                styles.option,
                isSelected ? styles.selectedOption : null,
                error ? styles.errorOption : null,
              ]}
            >
              <Typography
                variant="body2"
                weight="semibold"
                style={styles.optionText}
              >
                {option.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
      {helperText ? (
        <Typography
          variant="caption2"
          style={error ? styles.errorText : styles.helperText}
        >
          {helperText}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
  },
  options: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[3],
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.foundation.spacing[3],
    borderWidth: 1,
    borderColor: palette.theme.gray[10],
    borderRadius: theme.foundation.radii.s,
    backgroundColor: palette.white,
  },
  selectedOption: {
    borderColor: palette.theme.blue[50],
    borderWidth: 2,
    backgroundColor: palette.theme.blue[5],
  },
  errorOption: {
    borderColor: palette.tag.critical[700],
  },
  optionText: {
    color: theme.colors.text.primary,
  },
  helperText: {
    marginTop: theme.foundation.spacing[2],
    color: theme.colors.text.secondary,
  },
  errorText: {
    marginTop: theme.foundation.spacing[2],
    color: palette.tag.critical[700],
  },
}));
