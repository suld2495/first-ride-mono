import {
  usePausedRoutinesQuery,
  useUpdateRoutinePauseMutation,
} from '@repo/shared/hooks/useRoutine';
import type { Routine } from '@repo/types';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  Pressable,
  View,
} from 'react-native';

import EmptyState from '@/components/ui/empty-state';
import Loading from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

const HiddenRoutinesModal = () => {
  const { theme } = useAppTheme();
  const user = useAuthUser();
  const nickname = user?.nickname || '';
  const { showToast } = useToast();
  const { data: routines = [], isLoading } = usePausedRoutinesQuery(nickname);
  const updatePause = useUpdateRoutinePauseMutation(nickname);
  const [pendingRoutineId, setPendingRoutineId] = useState<
    Routine['routineId'] | null
  >(null);
  const [pressedRoutineId, setPressedRoutineId] = useState<
    Routine['routineId'] | null
  >(null);
  const [releaseButtonWidths, setReleaseButtonWidths] = useState<
    Partial<Record<Routine['routineId'], number>>
  >({});

  const handleReleaseButtonLayout = (
    routineId: Routine['routineId'],
    event: LayoutChangeEvent,
  ) => {
    const { width } = event.nativeEvent.layout;

    setReleaseButtonWidths((currentWidths) => {
      if (currentWidths[routineId] === width) {
        return currentWidths;
      }

      return {
        ...currentWidths,
        [routineId]: width,
      };
    });
  };

  const handleResumeRoutine = (routine: Routine) => {
    if (pendingRoutineId !== null) {
      return;
    }

    setPendingRoutineId(routine.routineId);
    setPressedRoutineId(null);
    updatePause.mutate(
      {
        routineId: routine.routineId,
        paused: false,
      },
      {
        onSuccess: ({ message }) => {
          showToast(message, 'success');
        },
        onError: (error) => {
          showToast(
            getApiErrorMessage(error, '루틴 상태를 변경하지 못했습니다.'),
            'error',
          );
        },
        onSettled: () => {
          setPendingRoutineId(null);
        },
      },
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View testID="hidden-routines-container" style={styles.container}>
      {routines.length ? (
        routines.map((routine) => {
          const isReleasePending = pendingRoutineId === routine.routineId;
          const releaseButtonWidth = releaseButtonWidths[routine.routineId];

          return (
            <View
              key={routine.routineId}
              style={styles.row}
              testID={`hidden-routine-row-${routine.routineId}`}
            >
              <Typography
                color={palette.theme.gray[60]}
                testID={`hidden-routine-name-${routine.routineId}`}
                variant="body2"
                weight="semibold"
              >
                {routine.routineName}
              </Typography>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isReleasePending }}
                disabled={isReleasePending}
                onLayout={(event) =>
                  handleReleaseButtonLayout(routine.routineId, event)
                }
                onPress={() => handleResumeRoutine(routine)}
                onPressIn={() => {
                  if (!isReleasePending) {
                    setPressedRoutineId(routine.routineId);
                  }
                }}
                onPressOut={() => {
                  setPressedRoutineId(null);
                }}
                style={[
                  styles.releaseButton,
                  releaseButtonWidth
                    ? { width: releaseButtonWidth }
                    : undefined,
                  pressedRoutineId === routine.routineId && !isReleasePending
                    ? styles.releaseButtonPressed
                    : undefined,
                ]}
                testID={`hidden-routine-release-button-${routine.routineId}`}
              >
                {isReleasePending ? (
                  <ReleaseSpinner
                    testID={`hidden-routine-release-spinner-${routine.routineId}`}
                  />
                ) : (
                  <Typography
                    color={theme.colors.text.gray}
                    variant="caption2"
                    weight="semibold"
                  >
                    숨기기 해제
                  </Typography>
                )}
              </Pressable>
            </View>
          );
        })
      ) : (
        <EmptyState
          icon="list-outline"
          message="숨긴 루틴이 없습니다."
          messageColor={theme.colors.text.gray}
        />
      )}
    </View>
  );
};

export default HiddenRoutinesModal;

type ReleaseSpinnerProps = {
  testID: string;
};

const ReleaseSpinner = ({ testID }: ReleaseSpinnerProps) => {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[styles.releaseSpinner, { transform: [{ rotate }] }]}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingTop: theme.foundation.spacing[3],
    paddingBottom: theme.foundation.spacing[3],
    gap: theme.foundation.spacing[0],
  },
  row: {
    height: baseFoundation.dimension.x44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  releaseButton: {
    height: baseFoundation.dimension.x20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseFoundation.dimension.x6,
    paddingHorizontal: theme.foundation.spacing[2],
    backgroundColor: palette.white,
  },
  releaseButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  releaseSpinner: {
    width: baseFoundation.dimension.x12,
    height: baseFoundation.dimension.x12,
    borderRadius: baseFoundation.dimension.x99,
    borderWidth: baseFoundation.dimension.x2,
    borderColor: theme.colors.text.gray,
    borderTopColor: 'transparent',
  },
}));
