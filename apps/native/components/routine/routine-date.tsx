import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from '@/lib/unistyles';
import { baseFoundation } from '@/theme/tokens';

import { IconButton } from '@/components/ui/icon-button';
import ThemeView from '@/components/ui/theme-view';
import { useRoutineType, useSetRoutineType } from '@/hooks/useRoutineSelection';

interface RoutineDateProps {
  date?: string;
}

const RoutineDate = (_props: RoutineDateProps) => {
  const type = useRoutineType();
  const setType = useSetRoutineType();

  return (
    <ThemeView style={styles.date_container}>
      <ThemeView style={styles.icons}>
        {type === 'number' ? (
          <>
            <IconButton
              icon={({ color }) => (
                <Ionicons name="keypad-sharp" size={baseFoundation.dimension.x22} color={color} />
              )}
              variant="ghost"
              onPress={() => setType('number')}
              accessibilityLabel="회차별 보기"
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
            />
            <IconButton
              icon={({ color }) => (
                <Ionicons name="grid-outline" size={baseFoundation.dimension.x22} color={color} />
              )}
              variant="ghost"
              onPress={() => setType('week')}
              accessibilityLabel="요일별 보기"
              accessibilityRole="button"
              accessibilityState={{ selected: false }}
            />
          </>
        ) : (
          <>
            <IconButton
              icon={({ color }) => (
                <Ionicons name="keypad-outline" size={baseFoundation.dimension.x22} color={color} />
              )}
              variant="ghost"
              onPress={() => setType('number')}
              accessibilityLabel="회차별 보기"
              accessibilityRole="button"
              accessibilityState={{ selected: false }}
            />
            <IconButton
              icon={({ color }) => (
                <Ionicons name="grid" size={baseFoundation.dimension.x22} color={color} />
              )}
              variant="ghost"
              onPress={() => setType('week')}
              accessibilityLabel="요일별 보기"
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
            />
          </>
        )}
      </ThemeView>
    </ThemeView>
  );
};

export default RoutineDate;

const styles = StyleSheet.create((theme) => ({
  date_container: {
    alignSelf: 'flex-end',
    paddingHorizontal: theme.foundation.spacing.s,
    paddingVertical: theme.foundation.spacing.xs,
    marginHorizontal: theme.foundation.spacing.m,
    borderRadius: theme.foundation.radii.l,
    backgroundColor: 'rgba(11,32,56,0.12)',
  },

  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing.xs,
  },
}));
