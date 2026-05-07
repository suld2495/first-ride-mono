import Ionicons from '@expo/vector-icons/Ionicons';
import { formatTimeRemaining } from '@repo/shared/utils/date-utils';
import { useEffect, useState } from 'react';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { Typography } from '@/components/ui/typography';
import ThemeView from '@/components/ui/theme-view';

interface QuestTimeProps {
  endDate: Date;
}

const QuestTime = ({ endDate }: QuestTimeProps) => {
  const { theme } = useAppTheme();
  const [timeRemaining, setTimeRemaining] = useState(() =>
    formatTimeRemaining(new Date(), endDate),
  );

  useEffect(() => {
    let start = 0;
    const timer = (time: number) => {
      if (!start) {
        start = time;
      }

      if (time - start >= 1000) {
        start = time;
        setTimeRemaining(formatTimeRemaining(new Date(), endDate));
      }

      rAF = requestAnimationFrame(timer);
    };

    let rAF = requestAnimationFrame(timer);

    return () => {
      cancelAnimationFrame(rAF);
    };
  }, [endDate]);

  return (
    <ThemeView style={styles.container} transparent>
      <Ionicons
        name="time-outline"
        size={baseFoundation.dimension.x14}
        color={theme.colors.text.secondary}
      />
      <Typography style={styles.text}>{timeRemaining}</Typography>
    </ThemeView>
  );
};

export default QuestTime;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[1],
  },

  text: {
    fontSize: baseFoundation.typography.size.caption2,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
}));
