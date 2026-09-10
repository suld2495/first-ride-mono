import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import {
  useSaveWidgetRoutineConfigMutation,
  useWidgetRoutineConfigQuery,
  useWidgetRoutineDataQuery,
} from '@repo/shared/hooks/useWidgetRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import type {
  Routine,
  UpdateWidgetRoutineConfigRequest,
  WidgetRoutineConfig,
  WidgetRoutineDataRoutine,
  WidgetRoutineSize,
  WidgetRoutineSizeKey,
} from '@repo/types';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import DraggableFlatList, {
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import RoutineWidgetPreview, {
  LARGE_WIDGET_ROUTINE_LIMIT,
  MEDIUM_WIDGET_ROUTINE_LIMIT,
  getRoutineWidgetAccentColor,
  SMALL_WIDGET_ROUTINE_LIMIT,
  type RoutineWidgetPreviewRoutine,
} from '@/components/widget/routine-widget-preview';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Loading from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import { baseFoundation, palette } from '@/theme/tokens';
import { refreshRoutineWidgetSnapshots } from '@/utils/routine-widget-refresh';
import { getApiErrorMessage } from '@/utils/error-utils';

const EMPTY_CONFIG: UpdateWidgetRoutineConfigRequest = {
  small: [],
  medium: [],
  large: [],
};

type RoutineOrderBySize = Record<WidgetRoutineSizeKey, number[]>;

const EMPTY_ROUTINE_ORDER: RoutineOrderBySize = {
  small: [],
  medium: [],
  large: [],
};

const WIDGET_SIZE_OPTIONS: Array<{
  apiSize: WidgetRoutineSize;
  key: WidgetRoutineSizeKey;
  label: string;
}> = [
  { apiSize: 'SMALL', key: 'small', label: '소형' },
  { apiSize: 'MEDIUM', key: 'medium', label: '중형' },
  { apiSize: 'LARGE', key: 'large', label: '대형' },
];

const WIDGET_ROUTINE_LIMITS: Record<WidgetRoutineSizeKey, number> = {
  small: SMALL_WIDGET_ROUTINE_LIMIT,
  medium: MEDIUM_WIDGET_ROUTINE_LIMIT,
  large: LARGE_WIDGET_ROUTINE_LIMIT,
};

const EMPTY_ROUTINES: Routine[] = [];

const getCompleteRoutineOrder = (
  routines: Routine[],
  preferredRoutineIds: number[],
): number[] => {
  const availableRoutineIds = new Set(
    routines.map((routine) => routine.routineId),
  );
  const validPreferredRoutineIds = [...new Set(preferredRoutineIds)].filter(
    (routineId) => availableRoutineIds.has(routineId),
  );
  const preferredRoutineIdSet = new Set(validPreferredRoutineIds);

  return [
    ...validPreferredRoutineIds,
    ...routines
      .map((routine) => routine.routineId)
      .filter((routineId) => !preferredRoutineIdSet.has(routineId)),
  ];
};

const getConfiguredRoutineIds = (
  config: WidgetRoutineConfig | undefined,
): UpdateWidgetRoutineConfigRequest => {
  if (!config) {
    return { ...EMPTY_CONFIG };
  }

  return {
    small: [...config.small]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .slice(0, WIDGET_ROUTINE_LIMITS.small)
      .map((item) => item.routineId),
    medium: [...config.medium]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .slice(0, WIDGET_ROUTINE_LIMITS.medium)
      .map((item) => item.routineId),
    large: [...config.large]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .slice(0, WIDGET_ROUTINE_LIMITS.large)
      .map((item) => item.routineId),
  };
};

const getRoutineCompletedDates = (routine: Routine): string[] =>
  routine.confirmations
    .filter((confirmation) => confirmation.status === 'PASS')
    .map((confirmation) => confirmation.date);

const getPreviewRoutines = ({
  allRoutines,
  selectedRoutineIds,
  widgetRoutines,
}: {
  allRoutines: Routine[];
  selectedRoutineIds: number[];
  widgetRoutines: WidgetRoutineDataRoutine[];
}): RoutineWidgetPreviewRoutine[] => {
  const routinesById = new Map(
    allRoutines.map((routine) => [routine.routineId, routine]),
  );
  const widgetRoutinesById = new Map(
    widgetRoutines.map((routine) => [routine.routineId, routine]),
  );

  return selectedRoutineIds.flatMap((routineId, index) => {
    const routine = routinesById.get(routineId);
    const widgetRoutine = widgetRoutinesById.get(routineId);

    if (!routine && !widgetRoutine) {
      return [];
    }

    return [
      {
        id: routineId,
        title: widgetRoutine?.routineName ?? routine?.routineName ?? '',
        weeklyCount: widgetRoutine?.completedCount ?? routine?.weeklyCount ?? 0,
        routineCount: widgetRoutine?.routineCount ?? routine?.routineCount ?? 0,
        completedDates:
          widgetRoutine?.completedDates ??
          (routine ? getRoutineCompletedDates(routine) : []),
        accentColor: getRoutineWidgetAccentColor(index),
      },
    ];
  });
};

interface RoutineRowProps {
  isActive: boolean;
  isSelected: boolean;
  onToggle: () => void;
  routine: Routine;
  drag: () => void;
}

const RoutineRow = ({
  drag,
  isActive,
  isSelected,
  onToggle,
  routine,
}: RoutineRowProps) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.routineRow}>
      <Pressable
        accessibilityLabel={`${routine.routineName} 순서 변경`}
        accessibilityRole="button"
        disabled={isActive}
        hitSlop={baseFoundation.spacing[2]}
        onPressIn={drag}
        style={styles.dragHandle}
        testID={`widget-routine-drag-handle-${routine.routineId}`}
      >
        <Ionicons
          color={theme.colors.text.tertiary}
          name="reorder-three"
          size={baseFoundation.iconSize.l}
        />
      </Pressable>
      <Pressable
        accessibilityLabel={`${routine.routineName} ${isSelected ? '선택됨' : '선택 안 됨'}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        disabled={isActive}
        onLongPress={drag}
        onPress={onToggle}
        style={styles.routineSelection}
        testID={`widget-routine-row-${routine.routineId}`}
      >
        <View
          style={[
            styles.routineColorDot,
            {
              backgroundColor:
                routine.symbolColor ?? getRoutineWidgetAccentColor(0),
            },
          ]}
        />
        <Typography
          color={theme.colors.field.text}
          numberOfLines={1}
          style={styles.routineName}
          weight="semibold"
        >
          {routine.routineName}
        </Typography>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected
                ? theme.colors.action.primary.default
                : 'transparent',
              borderColor: isSelected
                ? theme.colors.action.primary.default
                : theme.colors.border.strong,
            },
          ]}
        >
          {isSelected ? (
            <Ionicons
              color={theme.colors.action.primary.label}
              name="checkmark"
              size={baseFoundation.dimension.x12}
            />
          ) : null}
        </View>
      </Pressable>
    </View>
  );
};

const WidgetSizeSelector = ({
  activeSize,
  onSelect,
}: {
  activeSize: WidgetRoutineSizeKey;
  onSelect: (key: WidgetRoutineSizeKey) => void;
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel="위젯 크기 선택"
      style={[
        styles.sizeSelector,
        {
          backgroundColor:
            theme.name === 'dark'
              ? palette.theme.softBlue[10]
              : theme.colors.brand.bottomTab,
        },
      ]}
    >
      {WIDGET_SIZE_OPTIONS.map((option) => {
        const isSelected = activeSize === option.key;

        return (
          <Pressable
            accessibilityLabel={`${option.label} 위젯`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={[
              styles.sizeOption,
              isSelected && {
                backgroundColor: theme.colors.action.primary.default,
              },
            ]}
          >
            <Typography
              color={
                isSelected ? theme.colors.action.primary.label : palette.black
              }
              style={isSelected ? styles.activeSizeOptionLabel : undefined}
              variant="body2"
              weight="semibold"
            >
              {option.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function WidgetSettingsPage() {
  const { theme } = useAppTheme();
  const themeName = useColorScheme();
  const user = useAuthUser();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeSize, setActiveSize] = useState<WidgetRoutineSizeKey>('small');
  const [config, setConfig] = useState<UpdateWidgetRoutineConfigRequest>({
    ...EMPTY_CONFIG,
  });
  const [routineOrderBySize, setRoutineOrderBySize] =
    useState<RoutineOrderBySize>({
      ...EMPTY_ROUTINE_ORDER,
    });
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);

  const configQuery = useWidgetRoutineConfigQuery();
  const currentHomeDate = getWeekMonday(new Date());
  const routinesQuery = useRoutinesQuery(user?.nickname ?? '', currentHomeDate);
  const activeSizeOption =
    WIDGET_SIZE_OPTIONS.find((option) => option.key === activeSize) ??
    WIDGET_SIZE_OPTIONS[0];
  const widgetDataQuery = useWidgetRoutineDataQuery(activeSizeOption.apiSize);
  const saveConfigMutation = useSaveWidgetRoutineConfigMutation();
  const allRoutines = routinesQuery.data ?? EMPTY_ROUTINES;

  useEffect(() => {
    if (
      !configQuery.data ||
      routinesQuery.data === undefined ||
      isEditorInitialized
    ) {
      return;
    }

    const nextConfig = getConfiguredRoutineIds(configQuery.data);

    setConfig(nextConfig);
    setRoutineOrderBySize({
      small: getCompleteRoutineOrder(allRoutines, nextConfig.small),
      medium: getCompleteRoutineOrder(allRoutines, nextConfig.medium),
      large: getCompleteRoutineOrder(allRoutines, nextConfig.large),
    });
    setIsEditorInitialized(true);
  }, [allRoutines, configQuery.data, isEditorInitialized, routinesQuery.data]);

  const selectedRoutineIds = config[activeSize];
  const selectedRoutineIdSet = useMemo(
    () => new Set(selectedRoutineIds),
    [selectedRoutineIds],
  );
  const orderedRoutines = useMemo(() => {
    const routinesById = new Map(
      allRoutines.map((routine) => [routine.routineId, routine]),
    );

    return getCompleteRoutineOrder(
      allRoutines,
      routineOrderBySize[activeSize],
    ).flatMap((routineId) => {
      const routine = routinesById.get(routineId);

      return routine ? [routine] : [];
    });
  }, [activeSize, allRoutines, routineOrderBySize]);
  const previewRoutines = useMemo(
    () =>
      getPreviewRoutines({
        allRoutines,
        selectedRoutineIds,
        widgetRoutines: widgetDataQuery.data?.routines ?? [],
      }),
    [allRoutines, selectedRoutineIds, widgetDataQuery.data?.routines],
  );

  const updateCurrentSize = useCallback(
    (routineIds: number[]) => {
      setConfig((currentConfig) => ({
        ...currentConfig,
        [activeSize]: routineIds,
      }));
    },
    [activeSize],
  );

  const handleToggleRoutine = useCallback(
    (routineId: number) => {
      if (
        !selectedRoutineIdSet.has(routineId) &&
        selectedRoutineIds.length >= WIDGET_ROUTINE_LIMITS[activeSize]
      ) {
        return;
      }

      const nextSelectedRoutineIdSet = new Set(selectedRoutineIds);

      if (nextSelectedRoutineIdSet.has(routineId)) {
        nextSelectedRoutineIdSet.delete(routineId);
      } else {
        nextSelectedRoutineIdSet.add(routineId);
      }

      const nextRoutineIds = orderedRoutines
        .map((routine) => routine.routineId)
        .filter((orderedRoutineId) =>
          nextSelectedRoutineIdSet.has(orderedRoutineId),
        );

      updateCurrentSize(nextRoutineIds);
    },
    [
      activeSize,
      orderedRoutines,
      selectedRoutineIds,
      selectedRoutineIdSet,
      updateCurrentSize,
    ],
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: Routine[] }) => {
      const nextRoutineOrder = data.map((routine) => routine.routineId);
      const selectedIds = nextRoutineOrder.filter((routineId) =>
        selectedRoutineIdSet.has(routineId),
      );

      setRoutineOrderBySize((currentOrderBySize) => ({
        ...currentOrderBySize,
        [activeSize]: nextRoutineOrder,
      }));
      updateCurrentSize(selectedIds);
      void Haptics.selectionAsync();
    },
    [activeSize, selectedRoutineIdSet, updateCurrentSize],
  );

  const handleSave = useCallback(() => {
    if (saveConfigMutation.isPending) {
      return;
    }

    saveConfigMutation.mutate(
      {
        small: [...config.small],
        medium: [...config.medium],
        large: [...config.large],
      },
      {
        onSuccess: async () => {
          try {
            await refreshRoutineWidgetSnapshots({ themeName, queryClient });
            showToast('위젯 설정을 저장했습니다.', 'success');
          } catch (error) {
            showToast(
              getApiErrorMessage(
                error,
                '저장은 완료됐지만 위젯 데이터를 갱신하지 못했습니다.',
              ),
              'error',
            );
          }
        },
        onError: (error) => {
          showToast(
            getApiErrorMessage(error, '위젯 설정을 저장하지 못했습니다.'),
            'error',
          );
        },
      },
    );
  }, [config, queryClient, saveConfigMutation, showToast, themeName]);

  const renderRoutineItem = useCallback(
    ({ drag, isActive, item }: RenderItemParams<Routine>) => (
      <RoutineRow
        drag={drag}
        isActive={isActive}
        isSelected={selectedRoutineIdSet.has(item.routineId)}
        onToggle={() => handleToggleRoutine(item.routineId)}
        routine={item}
      />
    ),
    [handleToggleRoutine, selectedRoutineIdSet],
  );

  const listHeader = (
    <View>
      <WidgetSizeSelector activeSize={activeSize} onSelect={setActiveSize} />
      <View style={styles.previewSection}>
        <RoutineWidgetPreview
          routines={previewRoutines}
          size={activeSizeOption.apiSize}
          weekStartDate={widgetDataQuery.data?.weekStartDate}
        />
      </View>
      <View style={styles.listHeading}>
        <View style={styles.listHeadingRow}>
          <Typography
            color={theme.colors.brand.text}
            style={styles.listHeadingTitle}
            variant="subtitle2"
            weight="bold"
          >
            {activeSizeOption.label} 위젯에 표시할 루틴
          </Typography>
          <Typography
            color={theme.colors.text.muted}
            style={styles.listHeadingCount}
            variant="body3"
            weight="bold"
          >
            ({selectedRoutineIds.length} / {WIDGET_ROUTINE_LIMITS[activeSize]})
          </Typography>
        </View>
      </View>
      {orderedRoutines.length > 0 ? (
        <View pointerEvents="none" style={styles.routineListBackdropAnchor}>
          <View
            style={[
              styles.routineListBackdrop,
              {
                backgroundColor: theme.colors.field.background,
                height: baseFoundation.dimension.x60 * orderedRoutines.length,
              },
            ]}
          >
            {Array.from({ length: orderedRoutines.length - 1 }, (_, index) => (
              <View
                key={`routine-divider-${index}`}
                style={[
                  styles.routineDivider,
                  {
                    backgroundColor: palette.theme.gray[200],
                    top: baseFoundation.dimension.x60 * (index + 1),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );

  const listFooter = (
    <View style={{ height: insets.bottom + baseFoundation.spacing[4] }} />
  );

  const hasLoadError = configQuery.isError || routinesQuery.isError;

  if (hasLoadError) {
    return (
      <Container noPadding style={styles.container}>
        <PageHeader showBackButton title="위젯 설정" />
        <EmptyState message="위젯 설정을 불러오지 못했습니다." />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void configQuery.refetch();
            void routinesQuery.refetch();
          }}
          style={styles.retryButton}
        >
          <Typography color="inverse" weight="semibold">
            다시 시도
          </Typography>
        </Pressable>
      </Container>
    );
  }

  const isInitialLoading =
    configQuery.isLoading ||
    routinesQuery.isLoading ||
    !configQuery.data ||
    !isEditorInitialized;

  if (isInitialLoading) {
    return (
      <Container noPadding style={styles.container}>
        <PageHeader showBackButton title="위젯 설정" />
        <Loading />
      </Container>
    );
  }

  return (
    <Container noPadding style={styles.container}>
      <PageHeader
        right={
          <Button
            accessibilityLabel="위젯 설정 저장"
            loading={saveConfigMutation.isPending}
            onPress={handleSave}
            size="sm"
            title="저장"
          />
        }
        showBackButton
        title="위젯 설정"
      />
      <DraggableFlatList
        containerStyle={styles.scrollContainer}
        contentContainerStyle={styles.content}
        data={orderedRoutines}
        keyExtractor={(item) => String(item.routineId)}
        ListEmptyComponent={
          <EmptyState message="등록된 루틴이 없습니다." transparent />
        }
        ListFooterComponent={listFooter}
        ListHeaderComponent={listHeader}
        onDragEnd={handleDragEnd}
        renderItem={renderRoutineItem}
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
      />
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.brand.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[2],
    paddingBottom: theme.foundation.spacing[4],
  },
  sizeSelector: {
    flexDirection: 'row',
    padding: baseFoundation.dimension.x4,
    borderRadius: theme.foundation.radii.m,
    gap: baseFoundation.spacing[1],
  },
  sizeOption: {
    flex: 1,
    minHeight: baseFoundation.dimension.x40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.foundation.radii.s,
  },
  activeSizeOptionLabel: {
    textShadowColor: palette.black,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: baseFoundation.dimension.x1,
  },
  previewSection: {
    alignItems: 'center',
    paddingTop: theme.foundation.spacing[5],
    paddingBottom: theme.foundation.spacing[5],
  },
  listHeading: {
    gap: theme.foundation.spacing[1],
    paddingBottom: theme.foundation.spacing[3],
  },
  listHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[2],
  },
  listHeadingTitle: {
    flex: 1,
  },
  listHeadingCount: {
    flexShrink: 0,
    fontSize: theme.foundation.typography.size.subtitle2 - 4,
  },
  routineRow: {
    height: baseFoundation.dimension.x60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[3],
    paddingHorizontal: theme.foundation.spacing[4],
  },
  routineListBackdropAnchor: {
    height: 0,
  },
  routineListBackdrop: {
    position: 'absolute',
    right: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: theme.foundation.radii.m,
  },
  dragHandle: {
    width: baseFoundation.dimension.x24,
    minHeight: baseFoundation.dimension.x44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineSelection: {
    flex: 1,
    height: baseFoundation.dimension.x60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[3],
  },
  routineColorDot: {
    width: baseFoundation.dimension.x10,
    height: baseFoundation.dimension.x10,
    borderRadius: baseFoundation.dimension.x5,
  },
  routineName: {
    flex: 1,
    fontSize: theme.foundation.typography.size.l,
  },
  routineDivider: {
    position: 'absolute',
    right: theme.foundation.spacing[4],
    left: theme.foundation.spacing[4],
    height: baseFoundation.dimension.x1,
  },
  checkbox: {
    width: baseFoundation.dimension.x18,
    height: baseFoundation.dimension.x18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: baseFoundation.dimension.x2,
    borderRadius: theme.foundation.radii.s,
  },
  retryButton: {
    alignSelf: 'center',
    minHeight: baseFoundation.dimension.x44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[5],
    borderRadius: theme.foundation.radii.s,
    backgroundColor: theme.colors.action.primary.default,
  },
}));
