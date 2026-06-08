import {
  useDeleteRoutineMutation,
  useUpdateRoutinePauseMutation,
  useUpdateRoutineVisibilityMutation,
} from '@repo/shared/hooks/useRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import type { Routine } from '@repo/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Image,
  LayoutAnimation,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  type GestureResponderEvent,
  UIManager,
  View,
} from 'react-native';

import { RoutineMoreIndicatorIcon } from '@/components/icons/routine-icons';
import { RoutineContextMenuPanel } from '@/components/routine/routine-context-menu';
import { getRoutineScenePreviewOverlayAsset } from '@/components/routine/routine-scene-art';
import EmptyState from '@/components/ui/empty-state';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  useRoutineType,
  useSetRoutineForm,
  useSetRoutineId,
} from '@/hooks/useRoutineSelection';
import { baseFoundation } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

import { RoutineCountList, RoutineWeekList } from './weekly-routine';

interface RoutineListProps {
  routines: Routine[];
  date: string;
  listAreaHeight?: number;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  readOnly?: boolean;
}

const MAX_VISIBLE_ROUTINES = 4;
const COLLAPSED_VISIBLE_ROUTINES = 2;
const ROUTINE_ITEM_HEIGHT = 108; // 루틴 높이 + 루틴 간 간격
const ROUTINE_CONTEXT_MENU_TOP_OFFSET = 15;
const ROUTINE_CONTEXT_MENU_TRIGGER_HIT_WIDTH = baseFoundation.dimension.x32;
const ROUTINE_CONTEXT_MENU_TRIGGER_HIT_HEIGHT = baseFoundation.dimension.x56;
const ROUTINE_SCROLL_INDICATOR_HEIGHT = 24;
const ROUTINE_SCROLL_INDICATOR_TOP_SPACING = baseFoundation.spacing[2];
const ROUTINE_LIST_ANIMATION_DURATION = 220;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RoutineList = ({
  routines,
  date,
  listAreaHeight,
  refreshing = false,
  onRefresh,
  readOnly = false,
}: RoutineListProps) => {
  const setRoutineId = useSetRoutineId();
  const setRoutineForm = useSetRoutineForm();
  const type = useRoutineType();
  const router = useRouter();
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const user = useAuthUser();
  const themeName = useColorScheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [openMenuRoutineId, setOpenMenuRoutineId] = useState<number | null>(
    null,
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const [routineListScrollOffset, setRoutineListScrollOffset] = useState(0);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const nickname = user?.nickname || '';
  const updatePause = useUpdateRoutinePauseMutation(nickname);
  const updateVisibility = useUpdateRoutineVisibilityMutation();
  const deleteRoutine = useDeleteRoutineMutation(nickname);
  const showsRequestMenuItem = date === getWeekMonday(new Date());

  const canExpandList = routines.length > MAX_VISIBLE_ROUTINES;
  const hasPreviewLayer = canExpandList;
  const isScrollableList = isExpanded && routines.length > MAX_VISIBLE_ROUTINES;
  const routineItemHeight = ROUTINE_ITEM_HEIGHT;
  const collapsedListHeight = routineItemHeight * COLLAPSED_VISIBLE_ROUTINES;
  const expandedListHeight = routineItemHeight * MAX_VISIBLE_ROUTINES;
  const visibleListHeight =
    routineItemHeight * Math.min(routines.length, MAX_VISIBLE_ROUTINES);
  const rawListHeight = isExpanded
    ? expandedListHeight
    : hasPreviewLayer
      ? collapsedListHeight
      : visibleListHeight;
  const maxListHeight =
    typeof listAreaHeight === 'number'
      ? Math.max(
          listAreaHeight -
            (canExpandList
              ? ROUTINE_SCROLL_INDICATOR_HEIGHT +
                ROUTINE_SCROLL_INDICATOR_TOP_SPACING
              : 0),
          0,
        )
      : Number.POSITIVE_INFINITY;
  const listHeight = Math.min(rawListHeight, maxListHeight);
  const openMenuRoutineIndex = routines.findIndex(
    (routine) => routine.routineId === openMenuRoutineId,
  );
  const openMenuRoutine =
    openMenuRoutineIndex >= 0 ? routines[openMenuRoutineIndex] : null;

  useEffect(() => {
    setIsExpanded(false);
    setOpenMenuRoutineId(null);
    setRoutineListScrollOffset(0);
    overlayOpacity.setValue(1);
  }, [date, overlayOpacity, routines.length]);

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: isExpanded ? 0 : 1,
      duration: ROUTINE_LIST_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, overlayOpacity]);

  const handleShowRequestModal = useCallback(
    (id: number) => {
      setOpenMenuRoutineId(null);
      router.push('/modal?type=request');
      setRoutineId(id);
    },
    [router, setRoutineId],
  );

  const handlePressRoutineCheck = useCallback(
    (routine: Routine) => {
      if (!showsRequestMenuItem) {
        return;
      }

      handleShowRequestModal(routine.routineId);
    },
    [handleShowRequestModal, showsRequestMenuItem],
  );

  const handleShowUpdateModal = useCallback(
    (routine: Routine) => {
      setOpenMenuRoutineId(null);
      router.push('/modal?type=routine-update');
      setRoutineId(routine.routineId);
      setRoutineForm(routine);
    },
    [router, setRoutineForm, setRoutineId],
  );

  const handleToggleRoutinePause = useCallback(
    (routine: Routine) => {
      setOpenMenuRoutineId(null);
      updatePause.mutate(
        { routineId: routine.routineId, paused: !routine.paused },
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
        },
      );
    },
    [showToast, updatePause],
  );

  const handleToggleRoutineVisibility = useCallback(
    (routine: Routine) => {
      setOpenMenuRoutineId(null);
      updateVisibility.mutate(
        { routineId: routine.routineId, hidden: !routine.hidden },
        {
          onSuccess: ({ message }) => {
            showToast(message, 'success');
          },
          onError: (error) => {
            showToast(
              getApiErrorMessage(
                error,
                '루틴 표시 상태를 변경하지 못했습니다.',
              ),
              'error',
            );
          },
        },
      );
    },
    [showToast, updateVisibility],
  );

  const handleDeleteRoutine = useCallback(
    (routine: Routine) => {
      setOpenMenuRoutineId(null);
      Alert.alert('루틴 삭제', '삭제하시겠습니까?', [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          onPress: () => {
            deleteRoutine.mutate(routine.routineId, {
              onSuccess: () => {
                showToast('삭제되었습니다.', 'success');
                router.push('/(tabs)/(afterLogin)/(routine)');
              },
              onError: () => {
                showToast('문제가 발생하였습니다.', 'error');
              },
            });
          },
        },
      ]);
    },
    [deleteRoutine, router, showToast],
  );

  const handleToggleList = () => {
    LayoutAnimation.configureNext({
      duration: ROUTINE_LIST_ANIMATION_DURATION,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setIsExpanded((prev) => !prev);
    setOpenMenuRoutineId(null);
  };

  const handleToggleRoutineMenu = useCallback((routineId: number) => {
    setOpenMenuRoutineId((currentRoutineId) =>
      currentRoutineId === routineId ? null : routineId,
    );
  }, []);

  const handleRoutineListScrollOffsetChange = useCallback(
    (scrollOffset: number) => {
      setRoutineListScrollOffset(Math.max(scrollOffset, 0));
    },
    [],
  );

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const handlePressContextMenuBackdrop = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const triggerRoutineIndex = routines.findIndex((_, index) => {
        const triggerTop = index * routineItemHeight - routineListScrollOffset;

        return (
          containerWidth > 0 &&
          locationX >=
            containerWidth - ROUTINE_CONTEXT_MENU_TRIGGER_HIT_WIDTH &&
          locationX <= containerWidth &&
          locationY >= triggerTop &&
          locationY <= triggerTop + ROUTINE_CONTEXT_MENU_TRIGGER_HIT_HEIGHT
        );
      });

      if (triggerRoutineIndex >= 0) {
        handleToggleRoutineMenu(routines[triggerRoutineIndex].routineId);
        return;
      }

      setOpenMenuRoutineId(null);
    },
    [
      containerWidth,
      handleToggleRoutineMenu,
      routineItemHeight,
      routineListScrollOffset,
      routines,
    ],
  );

  return (
    <ThemeView
      style={styles.container}
      onLayout={handleContainerLayout}
      testID="routine-list-container"
    >
      {routines.length ? (
        <ThemeView
          style={[
            styles.listViewport,
            routines.length ? { height: listHeight } : null,
          ]}
          testID="routine-list-viewport"
        >
          {type === 'number' ? (
            <RoutineCountList
              routines={routines}
              date={date}
              itemHeight={routineItemHeight}
              listHeight={listHeight}
              scrollEnabled={isScrollableList}
              refreshing={refreshing}
              onRefresh={onRefresh}
              canRequestRoutine={showsRequestMenuItem && !readOnly}
              onRequestRoutine={handlePressRoutineCheck}
              openMenuRoutineId={openMenuRoutineId}
              onToggleRoutineMenu={handleToggleRoutineMenu}
              onScrollOffsetChange={handleRoutineListScrollOffsetChange}
              readOnly={readOnly}
              testID="routine-list-scroll"
            />
          ) : (
            <RoutineWeekList
              routines={routines}
              date={date}
              itemHeight={routineItemHeight}
              listHeight={listHeight}
              scrollEnabled={isScrollableList}
              refreshing={refreshing}
              onRefresh={onRefresh}
              canRequestRoutine={showsRequestMenuItem && !readOnly}
              onRequestRoutine={handlePressRoutineCheck}
              openMenuRoutineId={openMenuRoutineId}
              onToggleRoutineMenu={handleToggleRoutineMenu}
              onScrollOffsetChange={handleRoutineListScrollOffsetChange}
              readOnly={readOnly}
              testID="routine-list-scroll"
            />
          )}
          {hasPreviewLayer ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.previewOverlay,
                styles.previewOverlayVisibility,
                {
                  top: routineItemHeight,
                  height: routineItemHeight,
                },
                { opacity: overlayOpacity },
              ]}
              testID="routine-preview-overlay"
            >
              <Image
                source={getRoutineScenePreviewOverlayAsset(themeName).source}
                style={styles.previewOverlayImage}
                resizeMode="stretch"
              />
            </Animated.View>
          ) : null}
        </ThemeView>
      ) : (
        <EmptyState
          icon="list-outline"
          message="등록된 루틴이 없습니다."
          transparent
        />
      )}
      {openMenuRoutine ? (
        <>
          <Pressable
            accessibilityLabel="루틴 컨텍스트 메뉴 닫기"
            accessibilityRole="button"
            onPress={handlePressContextMenuBackdrop}
            style={styles.contextMenuBackdrop}
            testID="routine-context-menu-backdrop"
          />
          <RoutineContextMenuPanel
            routineId={openMenuRoutine.routineId}
            isHidden={openMenuRoutine.hidden}
            onEdit={() => handleShowUpdateModal(openMenuRoutine)}
            onHide={() => handleToggleRoutineVisibility(openMenuRoutine)}
            onPause={() => handleToggleRoutinePause(openMenuRoutine)}
            onRequest={() => handleShowRequestModal(openMenuRoutine.routineId)}
            onDelete={() => handleDeleteRoutine(openMenuRoutine)}
            showsRequestItem={showsRequestMenuItem}
            style={{
              top:
                openMenuRoutineIndex * routineItemHeight +
                ROUTINE_CONTEXT_MENU_TOP_OFFSET -
                routineListScrollOffset,
            }}
          />
        </>
      ) : null}
      {canExpandList ? (
        <View
          style={[
            styles.scrollIndicatorContainer,
            { top: listHeight + ROUTINE_SCROLL_INDICATOR_TOP_SPACING },
          ]}
          testID="routine-scroll-indicator-container"
        >
          <Pressable
            style={styles.scrollIndicator}
            onPress={handleToggleList}
            accessibilityRole="button"
            accessibilityLabel={
              isExpanded ? '루틴 리스트 접기' : '루틴 리스트 펼치기'
            }
            testID="routine-scroll-indicator"
          >
            <View
              style={isExpanded ? styles.scrollIndicatorIconExpanded : null}
            >
              <RoutineMoreIndicatorIcon color={theme.colors.text.tertiary} />
            </View>
          </Pressable>
        </View>
      ) : null}
    </ThemeView>
  );
};

export default RoutineList;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  listViewport: {
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  contextMenuBackdrop: {
    position: 'absolute',
    top: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    left: baseFoundation.spacing[0],
    zIndex: baseFoundation.zIndex.popover - 1,
  },
  previewOverlay: {
    position: 'absolute',
    right: baseFoundation.spacing[0],
    left: baseFoundation.spacing[0],
    overflow: 'hidden',
  },
  previewOverlayVisibility: {
    opacity: 1,
  },
  previewOverlayImage: {
    width: '100%',
    height: '100%',
  },
  scrollIndicatorContainer: {
    position: 'absolute',
    right: baseFoundation.spacing[0],
    left: baseFoundation.spacing[0],
    alignItems: 'center',
    zIndex: 10,
  },
  scrollIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.spacing[0.5],
    borderRadius: 8,
    borderWidth: 1,
    width: 60,
    height: ROUTINE_SCROLL_INDICATOR_HEIGHT,
    borderColor: theme.colors.text.secondary,
    backgroundColor: theme.colors.background.base,
  },
  scrollIndicatorIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
}));
