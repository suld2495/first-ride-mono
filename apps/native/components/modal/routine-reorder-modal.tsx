import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useAllRoutinesQuery,
  useRoutinesQuery,
  useUpdateRoutineOrderMutation,
} from '@repo/shared/hooks/useRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import type { Routine } from '@repo/types';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet as RNStyleSheet, View } from 'react-native';
import DraggableFlatList, {
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalFooter from '@/components/modal/modal-footer';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Loading from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

const EMPTY_ROUTINES: Routine[] = [];

const getRoutineStatus = (routine: Routine) => {
  if (routine.hidden) {
    return '숨김';
  }

  if (routine.paused) {
    return '일시정지';
  }

  return null;
};

const getRoutineIds = (routines: Routine[]) =>
  routines.map((routine) => routine.routineId);

const isSameOrder = (left: number[], right: number[]) =>
  left.length === right.length &&
  left.every((routineId, index) => routineId === right[index]);

const createMergedRoutineIds = (
  allRoutines: Routine[],
  originalVisibleRoutineIds: number[],
  orderedVisibleRoutineIds: number[],
) => {
  const visibleRoutineIdSet = new Set(originalVisibleRoutineIds);
  let nextVisibleRoutineIndex = 0;

  return allRoutines.map((routine) => {
    if (!visibleRoutineIdSet.has(routine.routineId)) {
      return routine.routineId;
    }

    const nextRoutineId =
      orderedVisibleRoutineIds[nextVisibleRoutineIndex] ?? routine.routineId;

    nextVisibleRoutineIndex += 1;
    return nextRoutineId;
  });
};

const RoutineReorderModal = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const user = useAuthUser();
  const { showToast } = useToast();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const targetDate = date || getWeekMonday(new Date());
  const {
    data: allRoutines = EMPTY_ROUTINES,
    isLoading: isAllRoutinesLoading,
  } = useAllRoutinesQuery(user?.nickname || '');
  const {
    data: visibleRoutines = EMPTY_ROUTINES,
    isLoading: isVisibleRoutinesLoading,
  } = useRoutinesQuery(user?.nickname || '', targetDate);
  const isLoading = isAllRoutinesLoading || isVisibleRoutinesLoading;
  const updateOrder = useUpdateRoutineOrderMutation(user?.nickname || '');
  const [orderedVisibleRoutines, setOrderedVisibleRoutines] = useState<
    Routine[]
  >([]);
  const originalVisibleRoutineIds = useMemo(
    () => getRoutineIds(visibleRoutines),
    [visibleRoutines],
  );
  const originalVisibleRoutineIdsKey = useMemo(
    () => originalVisibleRoutineIds.join(','),
    [originalVisibleRoutineIds],
  );

  useEffect(() => {
    setOrderedVisibleRoutines(visibleRoutines);
  }, [originalVisibleRoutineIdsKey, visibleRoutines]);

  const orderedVisibleRoutineIds = useMemo(
    () => getRoutineIds(orderedVisibleRoutines),
    [orderedVisibleRoutines],
  );
  const hasChanges = !isSameOrder(
    originalVisibleRoutineIds,
    orderedVisibleRoutineIds,
  );

  const handleDragEnd = useCallback(({ data }: { data: Routine[] }) => {
    setOrderedVisibleRoutines(data);
    Haptics.selectionAsync();
  }, []);

  const handleSave = useCallback(() => {
    if (!hasChanges) {
      router.back();
      return;
    }

    updateOrder.mutate(
      {
        routineIds: createMergedRoutineIds(
          allRoutines,
          originalVisibleRoutineIds,
          orderedVisibleRoutineIds,
        ),
      },
      {
        onSuccess: ({ message }) => {
          showToast(message, 'success');
          router.back();
        },
        onError: (error) => {
          showToast(
            getApiErrorMessage(error, '루틴 순서를 변경하지 못했습니다.'),
            'error',
          );
        },
      },
    );
  }, [
    allRoutines,
    hasChanges,
    orderedVisibleRoutineIds,
    originalVisibleRoutineIds,
    router,
    showToast,
    updateOrder,
  ]);

  const renderRoutineItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Routine>) => {
      const status = getRoutineStatus(item);

      return (
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          accessibilityRole="button"
          accessibilityLabel={`${item.routineName} 순서 이동`}
          testID={`routine-reorder-item-${item.routineId}`}
          style={[styles.item, isActive && styles.activeItem]}
        >
          <Pressable
            onLongPress={drag}
            hitSlop={baseFoundation.dimension.x8}
            accessibilityRole="button"
            accessibilityLabel={`${item.routineName} 드래그 핸들`}
            style={styles.dragHandle}
          >
            <Ionicons
              name="reorder-three"
              size={baseFoundation.iconSize.l}
              color={theme.colors.text.tertiary}
            />
          </Pressable>
          <View style={styles.itemText}>
            <Typography
              variant="body2"
              weight="semibold"
              style={styles.routineName}
              numberOfLines={1}
            >
              {item.routineName}
            </Typography>
          </View>
          {status ? (
            <View
              style={[
                styles.statusBadge,
                status === '숨김' && styles.hiddenBadge,
                status === '일시정지' && styles.pausedBadge,
              ]}
            >
              <Typography variant="caption" style={styles.statusText}>
                {status}
              </Typography>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [theme.colors.text.tertiary],
  );

  const footer = useMemo(
    () => (
      <ThemeView
        transparent
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, styles.footer.paddingTop),
          },
        ]}
      >
        <Button
          title="완료"
          fullWidth
          backgroundColor={theme.colors.text.gray}
          onPress={handleSave}
          loading={updateOrder.isPending}
          disabled={!orderedVisibleRoutines.length || updateOrder.isPending}
        />
      </ThemeView>
    ),
    [
      handleSave,
      insets.bottom,
      orderedVisibleRoutines.length,
      theme.colors.text.gray,
      updateOrder.isPending,
    ],
  );

  if (isLoading) {
    return (
      <>
        <Loading />
        <ModalFooter>{footer}</ModalFooter>
      </>
    );
  }

  return (
    <>
      <ThemeView style={styles.container} transparent>
        {orderedVisibleRoutines.length ? (
          <DraggableFlatList
            data={orderedVisibleRoutines}
            keyExtractor={(item) => item.routineId.toString()}
            renderItem={renderRoutineItem}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            testID="routine-reorder-list"
          />
        ) : (
          <EmptyState
            icon="list-outline"
            message="등록된 루틴이 없습니다."
            transparent
          />
        )}
      </ThemeView>
      <ModalFooter>{footer}</ModalFooter>
    </>
  );
};

export default RoutineReorderModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  listContent: {
    gap: theme.foundation.spacing[3],
    paddingTop: theme.foundation.spacing[2],
    paddingBottom: theme.foundation.spacing[6],
  },
  item: {
    minHeight: baseFoundation.dimension.x60,
    borderRadius: theme.foundation.radii.m,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.elevated,
    paddingHorizontal: theme.foundation.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[3],
  },
  activeItem: {
    opacity: 0.92,
    shadowColor: theme.colors.border.strong,
    shadowOffset: {
      width: baseFoundation.dimension.x0,
      height: baseFoundation.dimension.x4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  dragHandle: {
    width: baseFoundation.dimension.x32,
    height: baseFoundation.dimension.x44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    minWidth: baseFoundation.dimension.x0,
  },
  routineName: {
    color: theme.colors.text.primary,
  },
  statusBadge: {
    minWidth: baseFoundation.dimension.x58,
    height: baseFoundation.dimension.x24,
    borderRadius: theme.foundation.radii.s,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.feedback.success.bg,
    paddingHorizontal: theme.foundation.spacing[2],
  },
  pausedBadge: {
    backgroundColor: theme.colors.feedback.warning.bg,
  },
  hiddenBadge: {
    backgroundColor: theme.colors.background.sunken,
  },
  statusText: {
    color: theme.colors.text.secondary,
  },
  footer: {
    width: '100%',
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[4],
    borderTopWidth: RNStyleSheet.hairlineWidth,
    borderTopColor: theme.colors.brand.bottomTab,
  },
}));
