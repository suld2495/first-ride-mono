import Ionicons from '@expo/vector-icons/Ionicons';
import type { Routine } from '@repo/types';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  UIManager,
  View,
} from 'react-native';

import EmptyState from '@/components/ui/empty-state';
import ThemeView from '@/components/ui/theme-view';
import { useRoutineType, useSetRoutineId } from '@/hooks/useRoutineSelection';
import { StyleSheet } from '@/lib/unistyles';
import { baseFoundation } from '@/theme/tokens';

import { RoutineCountList, RoutineWeekList } from './weekly-routine';

const previewOverlayImage = require('@/assets/routine/preview-overlay.png');

interface RoutineListProps {
  routines: Routine[];
  date: string;
  listAreaHeight?: number;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

const MAX_VISIBLE_ROUTINES = 4;
const COLLAPSED_VISIBLE_ROUTINES = 2;
const DEFAULT_ROUTINE_LIST_AREA_HEIGHT = 480;
const ROUTINE_LIST_TOP_SPACING = baseFoundation.spacing.s;
const ROUTINE_SCROLL_INDICATOR_HEIGHT = 24;
const ROUTINE_SCROLL_INDICATOR_TOP_SPACING = baseFoundation.spacing.s;
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
  listAreaHeight = DEFAULT_ROUTINE_LIST_AREA_HEIGHT,
  refreshing = false,
  onRefresh,
}: RoutineListProps) => {
  const setRoutineId = useSetRoutineId();
  const type = useRoutineType();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const hasPreviewLayer = routines.length >= COLLAPSED_VISIBLE_ROUTINES;
  const canExpandList = routines.length >= COLLAPSED_VISIBLE_ROUTINES;
  const isScrollableList = isExpanded && routines.length > MAX_VISIBLE_ROUTINES;
  const reservedHeight =
    ROUTINE_LIST_TOP_SPACING +
    (canExpandList
      ? ROUTINE_SCROLL_INDICATOR_TOP_SPACING + ROUTINE_SCROLL_INDICATOR_HEIGHT
      : 0);
  const routineViewportHeight = Math.max(listAreaHeight - reservedHeight, 0);
  const routineItemHeight = routineViewportHeight / MAX_VISIBLE_ROUTINES;
  const collapsedListHeight = routineItemHeight * COLLAPSED_VISIBLE_ROUTINES;
  const expandedListHeight = routineViewportHeight;

  useEffect(() => {
    setIsExpanded(false);
    overlayOpacity.setValue(1);
  }, [date, routines.length]);

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: isExpanded ? 0 : 1,
      duration: ROUTINE_LIST_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, overlayOpacity]);

  const handleShowRequestModal = (id: number) => {
    router.push('/modal?type=request');
    setRoutineId(id);
  };

  const handleShowDetailModal = (id: number) => {
    router.push('/modal?type=routine-detail');
    setRoutineId(id);
  };

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
  };

  return (
    <ThemeView style={styles.container}>
      {routines.length ? (
        <ThemeView
          style={[
            styles.listViewport,
            hasPreviewLayer && !isExpanded
              ? { height: collapsedListHeight }
              : null,
            isExpanded ? { height: expandedListHeight } : null,
          ]}
          testID="routine-list-viewport"
        >
          {type === 'number' ? (
            <RoutineCountList
              routines={routines}
              date={date}
              itemHeight={routineItemHeight}
              scrollEnabled={isScrollableList}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onShowRequestModal={handleShowRequestModal}
              onShowDetailModal={handleShowDetailModal}
              testID="routine-list-scroll"
            />
          ) : (
            <RoutineWeekList
              routines={routines}
              date={date}
              itemHeight={routineItemHeight}
              scrollEnabled={isScrollableList}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onShowRequestModal={handleShowRequestModal}
              onShowDetailModal={handleShowDetailModal}
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
                source={previewOverlayImage}
                style={styles.previewOverlayImage}
                resizeMode="stretch"
              />
            </Animated.View>
          ) : null}
        </ThemeView>
      ) : (
        <EmptyState icon="list-outline" message="등록된 루틴이 없습니다." />
      )}
      {canExpandList ? (
        <View style={styles.scrollIndicatorContainer}>
          <Pressable
            style={styles.scrollIndicator}
            onPress={handleToggleList}
            accessibilityRole="button"
            accessibilityLabel={
              isExpanded ? '루틴 리스트 접기' : '루틴 리스트 펼치기'
            }
            testID="routine-scroll-indicator"
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={baseFoundation.dimension.x18}
              color="#4C769C"
            />
          </Pressable>
        </View>
      ) : null}
    </ThemeView>
  );
};

export default RoutineList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listViewport: {
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  previewOverlay: {
    position: 'absolute',
    right: 0,
    left: 0,
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
    alignItems: 'center',
  },
  scrollIndicator: {
    marginTop: ROUTINE_SCROLL_INDICATOR_TOP_SPACING,
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.dimension.x2,
    borderRadius: 8,
    borderWidth: 1,
    width: 60,
    height: ROUTINE_SCROLL_INDICATOR_HEIGHT,
    borderColor: '#83B0D6',
    backgroundColor: '#B0DAFF',
  },
});
