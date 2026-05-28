import Ionicons from '@expo/vector-icons/Ionicons';
import type { JobOption } from '@repo/types';
import { Image, Pressable, View } from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

interface JobOptionSelectorProps {
  options: JobOption[];
  value: string;
  onSelect: (jobName: string) => void;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
}

const getJobBackgroundStyle = (option: JobOption) => {
  const normalizedCode =
    `${option.jobType} ${option.characterCode}`.toUpperCase();

  if (normalizedCode.includes('MAGE') || normalizedCode.includes('RED')) {
    return styles.optionRed;
  }

  if (normalizedCode.includes('ARCHER') || normalizedCode.includes('GREEN')) {
    return styles.optionGreen;
  }

  return styles.optionBlue;
};

const JobOptionSelector = ({
  options,
  value,
  onSelect,
  error = false,
  helperText,
  isLoading = false,
}: JobOptionSelectorProps) => {
  const statusText = isLoading
    ? '직업을 불러오는 중입니다.'
    : helperText || undefined;

  return (
    <View style={styles.container}>
      <View style={styles.optionRow}>
        {options.map((option) => {
          const isSelected = option.jobName === value;

          return (
            <Pressable
              key={option.jobType}
              accessibilityLabel={`${option.jobName} 선택`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.jobName)}
              style={[
                styles.option,
                getJobBackgroundStyle(option),
                isSelected ? styles.optionSelected : null,
                error ? styles.optionError : null,
              ]}
            >
              {isSelected ? (
                <View
                  style={styles.selectedBadge}
                  testID={`job-option-selected-check-${option.jobType}`}
                  pointerEvents="none"
                >
                  <Ionicons
                    name="checkmark"
                    size={baseFoundation.iconSize.s}
                    color={palette.white}
                  />
                </View>
              ) : null}
              <Image
                source={{ uri: option.imageUrl }}
                resizeMode="contain"
                style={styles.image}
              />
              <Typography
                variant="caption1"
                weight="semibold"
                style={styles.optionLabel}
              >
                {option.jobName}
              </Typography>
            </Pressable>
          );
        })}
      </View>
      {statusText ? (
        <Typography
          variant="caption2"
          color={error ? 'error' : 'secondary'}
          style={styles.helperText}
        >
          {statusText}
        </Typography>
      ) : null}
    </View>
  );
};

export default JobOptionSelector;

const styles = StyleSheet.create((theme) => ({
  container: {
    width: baseFoundation.dimension.x250,
  },
  optionRow: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[2],
  },
  option: {
    flex: 1,
    minHeight: baseFoundation.dimension.x96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[2],
    paddingVertical: theme.foundation.spacing[2],
    borderWidth: 1,
    borderRadius: theme.foundation.radii.s,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.surface,
    position: 'relative',
  },
  optionSelected: {
    borderWidth: 3,
    borderColor: palette.theme.gray[95],
    shadowColor: palette.theme.gray[95],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  optionBlue: {
    backgroundColor: '#8DB9DC',
  },
  optionGreen: {
    backgroundColor: palette.theme.softGreen[20],
  },
  optionRed: {
    backgroundColor: palette.theme.softRed[10],
  },
  optionError: {
    borderColor: theme.colors.feedback.error.border,
  },
  image: {
    width: baseFoundation.dimension.x48,
    height: baseFoundation.dimension.x48,
  },
  selectedBadge: {
    position: 'absolute',
    top: theme.foundation.spacing[1],
    right: theme.foundation.spacing[1],
    width: baseFoundation.dimension.x20,
    height: baseFoundation.dimension.x20,
    borderRadius: baseFoundation.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.theme.gray[95],
  },
  optionLabel: {
    marginTop: theme.foundation.spacing[1],
    textAlign: 'center',
  },
  helperText: {
    marginTop: theme.foundation.spacing[1],
  },
}));
