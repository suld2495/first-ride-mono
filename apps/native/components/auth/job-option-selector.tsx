import type { JobOption } from '@repo/types';
import { useEffect, useMemo, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
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

type CharacterGender = 'female' | 'male';
type JobRole = 'WARRIOR' | 'MAGE' | 'ARCHER';

const JOB_ORDER: JobRole[] = ['WARRIOR', 'MAGE', 'ARCHER'];

const CHARACTER_IMAGES: Record<JobRole, ImageSourcePropType> = {
  WARRIOR:
    require('../../assets/routine/character-blue.png') as ImageSourcePropType,
  MAGE: require('../../assets/routine/character-red.png') as ImageSourcePropType,
  ARCHER:
    require('../../assets/routine/character-green.png') as ImageSourcePropType,
};

const JOB_THEME: Record<
  JobRole,
  {
    background: string;
    card: string;
    accent: string;
    accentSoft: string;
    accentDark: string;
  }
> = {
  WARRIOR: {
    background: palette.theme.blue[10],
    card: palette.theme.blue[5],
    accent: palette.theme.blue[50],
    accentSoft: palette.theme.softBlue[50],
    accentDark: palette.theme.blue[80],
  },
  MAGE: {
    background: palette.theme.red[10],
    card: palette.theme.red[5],
    accent: palette.theme.red[50],
    accentSoft: palette.theme.softRed[50],
    accentDark: palette.theme.red[80],
  },
  ARCHER: {
    background: palette.theme.green[10],
    card: palette.theme.green[5],
    accent: palette.theme.green[50],
    accentSoft: palette.theme.softGreen[50],
    accentDark: palette.theme.green[80],
  },
};

const JOB_DESCRIPTION: Record<JobRole, string> = {
  WARRIOR:
    '전사는 목표를 정하고 꾸준히 실천하는 사람에게 어울리는 캐릭터예요. 루틴을 반복해 꾸준함이 쌓일수록 더 강한 모습으로 성장해요.',
  MAGE: '마법사는 꾸준한 노력이 특별한 힘을 만든다고 믿는 캐릭터예요. 루틴을 반복할수록 마력이 쌓이고, 더 강력한 마법을 펼칠 수 있는 모습으로 성장해요.',
  ARCHER:
    '궁수는 한 걸음씩 목표를 향해 나아가는 사람에게 어울리는 캐릭터예요. 루틴을 반복할수록 집중력과 실력이 쌓여, 더욱 정확한 한 발을 쏘는 궁수로 성장해요.',
};

export const getJobRole = (option?: JobOption): JobRole => {
  const jobType = option?.jobType.toUpperCase() ?? '';
  const jobName = option?.jobName ?? '';

  if (
    jobType.includes('WARRIOR') ||
    jobName.includes('검사') ||
    jobName.includes('전사')
  ) {
    return 'WARRIOR';
  }

  if (jobType.includes('MAGE') || jobName.includes('마법사')) {
    return 'MAGE';
  }

  if (jobType.includes('ARCHER') || jobName.includes('궁수')) {
    return 'ARCHER';
  }

  return 'WARRIOR';
};

export const getJobDisplayName = (option?: JobOption) => {
  if (!option) {
    return '전사';
  }

  const role = getJobRole(option);
  const { jobName, jobType: rawJobType } = option;
  const jobType = rawJobType.toUpperCase();

  if (
    role === 'MAGE' &&
    (jobType.includes('MAGE') || jobName.includes('마법사'))
  ) {
    return '마법사';
  }

  if (
    role === 'ARCHER' &&
    (jobType.includes('ARCHER') || jobName.includes('궁수'))
  ) {
    return '궁수';
  }

  if (
    role === 'WARRIOR' &&
    (jobType.includes('WARRIOR') ||
      jobName.includes('검사') ||
      jobName.includes('전사'))
  ) {
    return '전사';
  }

  return option.jobName;
};

export const getJobTheme = (option?: JobOption) =>
  JOB_THEME[getJobRole(option)];

const getSortedOptions = (options: JobOption[]) =>
  JOB_ORDER.flatMap((role) =>
    options.filter((option) => getJobRole(option) === role),
  );

const getCharacterImage = (
  option: JobOption | undefined,
  _gender: CharacterGender,
) => CHARACTER_IMAGES[getJobRole(option)];

const JobOptionSelector = ({
  options,
  value,
  onSelect,
  error = false,
  helperText,
  isLoading = false,
}: JobOptionSelectorProps) => {
  const { theme } = useAppTheme();
  const [gender, setGender] = useState<CharacterGender>('female');
  const sortedOptions = useMemo(() => getSortedOptions(options), [options]);
  const selectedIndex = sortedOptions.findIndex(
    (option) => option.jobName === value,
  );
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const activeOption = sortedOptions[activeIndex];
  const activeTheme = getJobTheme(activeOption);
  const statusText = isLoading
    ? '직업을 불러오는 중입니다.'
    : helperText || undefined;

  useEffect(() => {
    if (!value && sortedOptions.length > 0) {
      onSelect(sortedOptions[0].jobName);
    }
  }, [onSelect, sortedOptions, value]);

  const handleMove = (direction: -1 | 1) => {
    if (sortedOptions.length === 0) {
      return;
    }

    const nextIndex =
      (activeIndex + direction + sortedOptions.length) % sortedOptions.length;
    onSelect(sortedOptions[nextIndex].jobName);
  };

  if (sortedOptions.length === 0) {
    return (
      <View style={styles.container}>
        {statusText ? (
          <Typography
            variant="caption2"
            color={error ? palette.tag.critical[700] : theme.colors.text.label}
            style={styles.helperText}
          >
            {statusText}
          </Typography>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.genderSegment} accessibilityRole="tablist">
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="여자 캐릭터 선택"
          accessibilityState={{ selected: gender === 'female' }}
          onPress={() => setGender('female')}
          style={[
            styles.genderTab,
            gender === 'female' ? styles.genderTabSelected : null,
          ]}
        >
          <Typography
            variant="caption1"
            weight="semibold"
            color={
              gender === 'female'
                ? theme.colors.text.gray
                : palette.theme.gray[10]
            }
          >
            여자
          </Typography>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="남자 캐릭터 선택"
          accessibilityState={{ selected: gender === 'male' }}
          onPress={() => setGender('male')}
          style={[
            styles.genderTab,
            gender === 'male' ? styles.genderTabSelected : null,
          ]}
        >
          <Typography
            variant="caption1"
            weight="semibold"
            color={
              gender === 'male'
                ? theme.colors.text.gray
                : palette.theme.gray[10]
            }
          >
            남자
          </Typography>
        </Pressable>
      </View>

      <View testID="job-option-row" style={styles.stage}>
        <Pressable
          accessibilityLabel="이전 직업"
          accessibilityRole="button"
          onPress={() => handleMove(-1)}
          style={styles.arrowButton}
        >
          <Typography variant="title" color={palette.theme.gray[30]}>
            ‹
          </Typography>
        </Pressable>

        <View
          testID="job-character-card"
          style={[styles.card, { backgroundColor: activeTheme.card }]}
        >
          <Image
            source={getCharacterImage(activeOption, gender)}
            resizeMode="contain"
            style={styles.heroImage}
          />

          <Typography variant="title" weight="semibold" style={styles.jobTitle}>
            {getJobDisplayName(activeOption)}
          </Typography>
          <Typography
            variant="body2"
            color={palette.theme.gray[15]}
            style={styles.description}
          >
            {JOB_DESCRIPTION[getJobRole(activeOption)]}
          </Typography>

          <View style={styles.levelPanel}>
            {[0, 1, 2].map((index) => {
              const isUnlocked = index === 0;

              return (
                <View key={index} style={styles.levelItem}>
                  <View style={styles.levelImageWrap}>
                    <Image
                      source={getCharacterImage(activeOption, gender)}
                      resizeMode="contain"
                      tintColor={
                        isUnlocked ? undefined : activeTheme.accentDark
                      }
                      style={[
                        styles.levelImage,
                        isUnlocked ? null : styles.lockedLevelImage,
                      ]}
                    />
                    {isUnlocked ? null : (
                      <Typography
                        variant="title"
                        weight="semibold"
                        color={palette.white}
                        style={styles.questionMark}
                      >
                        ?
                      </Typography>
                    )}
                  </View>
                  <Typography
                    variant="caption2"
                    weight="semibold"
                    color={theme.colors.text.label}
                  >
                    레벨 {index + 1}
                  </Typography>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable
          accessibilityLabel="다음 직업"
          accessibilityRole="button"
          onPress={() => handleMove(1)}
          style={styles.arrowButton}
        >
          <Typography variant="title" color={palette.theme.gray[30]}>
            ›
          </Typography>
        </Pressable>
      </View>

      <View style={styles.pagination}>
        {sortedOptions.map((option, index) => {
          const displayName = getJobDisplayName(option);
          const isSelected = index === activeIndex;

          return (
            <Pressable
              key={option.jobType}
              accessibilityLabel={`${displayName} 선택`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.jobName)}
              style={styles.dotButton}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isSelected
                      ? activeTheme.accentDark
                      : activeTheme.accentSoft,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {statusText ? (
        <Typography
          variant="caption2"
          color={error ? palette.tag.critical[700] : theme.colors.text.label}
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
  genderSegment: {
    width: 160,
    height: baseFoundation.dimension.x32,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.foundation.radii.s,
    borderWidth: 3,
    borderColor: palette.theme.gray[40],
    backgroundColor: palette.theme.gray[40],
    padding: 2,
  },
  genderTab: {
    flex: 1,
    height: baseFoundation.dimension.x24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseFoundation.dimension.x4,
  },
  genderTabSelected: {
    backgroundColor: palette.white,
  },
  stage: {
    width: '100%',
    marginTop: theme.foundation.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: baseFoundation.dimension.x44,
    height: baseFoundation.dimension.x44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 292,
    maxWidth: '76%',
    minHeight: 430,
    alignItems: 'center',
    paddingTop: theme.foundation.spacing[6],
    paddingHorizontal: theme.foundation.spacing[5],
    paddingBottom: theme.foundation.spacing[4],
    borderRadius: theme.foundation.radii.xl,
  },
  heroImage: {
    width: 112,
    height: 112,
  },
  jobTitle: {
    marginTop: theme.foundation.spacing[4],
    color: theme.colors.text.gray,
    textAlign: 'center',
  },
  description: {
    width: '100%',
    marginTop: theme.foundation.spacing[3],
    textAlign: 'center',
    lineHeight: 24,
  },
  levelPanel: {
    width: '100%',
    minHeight: 96,
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[3],
    borderRadius: theme.foundation.radii.l,
    backgroundColor: palette.white,
    paddingHorizontal: theme.foundation.spacing[3],
    paddingVertical: theme.foundation.spacing[3],
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
  },
  levelImageWrap: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelImage: {
    width: 54,
    height: 54,
  },
  lockedLevelImage: {
    opacity: 0.95,
  },
  questionMark: {
    position: 'absolute',
  },
  pagination: {
    marginTop: theme.foundation.spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[1],
  },
  dotButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  helperText: {
    marginTop: theme.foundation.spacing[3],
  },
}));
