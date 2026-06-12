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

const getJobDisplayName = (option: JobOption) => {
  if (option.jobType.toUpperCase().includes('WARRIOR')) {
    return '전사';
  }

  return option.jobName;
};

const getVisibleOptions = (options: JobOption[], value: string) => {
  const selectedIndex = options.findIndex((option) => option.jobName === value);

  if (selectedIndex < 0 || options.length < 3) {
    return options;
  }

  const previous =
    options[(selectedIndex - 1 + options.length) % options.length];
  const selected = options[selectedIndex];
  const next = options[(selectedIndex + 1) % options.length];

  return [previous, selected, next];
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
  const hasSelection = value.length > 0;
  const visibleOptions = hasSelection
    ? getVisibleOptions(options, value)
    : options;

  return (
    <View style={styles.container}>
      <View
        testID="job-option-row"
        style={[
          styles.optionRow,
          hasSelection ? styles.selectedOptionRow : styles.defaultOptionRow,
        ]}
      >
        {visibleOptions.map((option) => {
          const isSelected = option.jobName === value;
          const displayName = getJobDisplayName(option);

          return (
            <Pressable
              key={option.jobType}
              accessibilityLabel={`${displayName} 선택`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.jobName)}
              style={[
                styles.option,
                hasSelection ? styles.sideOption : styles.defaultOption,
                isSelected ? styles.centerOption : null,
                isSelected ? styles.optionSelected : null,
                error ? styles.optionError : null,
              ]}
            >
              <Image
                source={{ uri: option.imageUrl }}
                resizeMode="contain"
                style={[styles.image, isSelected ? styles.selectedImage : null]}
              />
              <Typography
                variant="body2"
                weight="semibold"
                style={styles.optionLabel}
              >
                {displayName}
              </Typography>
            </Pressable>
          );
        })}
      </View>
      {statusText ? (
        <Typography
          variant="caption2"
          color={error ? palette.tag.critical[700] : palette.theme.gray[70]}
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
    width: '100%',
    alignItems: 'center',
  },
  optionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[3],
  },
  selectedOptionRow: {
    width: '102.5%',
  },
  defaultOptionRow: {
    paddingHorizontal: baseFoundation.dimension.x18,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[3],
    paddingVertical: theme.foundation.spacing[4],
    borderWidth: 0,
    borderRadius: theme.foundation.radii.s,
    backgroundColor: palette.theme.blue[5],
    position: 'relative',
  },
  defaultOption: {
    flex: 1,
    height: 138,
  },
  sideOption: {
    flex: 100,
    height: 138,
  },
  centerOption: {
    flex: 148,
    height: 205,
  },
  optionSelected: {
    borderWidth: 3,
    borderColor: palette.theme.blue[50],
  },
  optionError: {
    borderColor: palette.tag.critical[700],
    borderWidth: 2,
  },
  image: {
    width: 64,
    height: 64,
  },
  selectedImage: {
    width: 92,
    height: 92,
  },
  optionLabel: {
    marginTop: theme.foundation.spacing[3],
    textAlign: 'center',
    color: palette.theme.blue[100],
  },
  helperText: {
    marginTop: theme.foundation.spacing[3],
  },
}));
