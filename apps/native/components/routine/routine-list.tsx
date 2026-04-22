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
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

const MAX_VISIBLE_ROUTINES = 4;
const COLLAPSED_VISIBLE_ROUTINES = 2;
const ROUTINE_VISIBLE_ITEM_HEIGHT = 120;
const ROUTINE_VIEWPORT_BOTTOM_PADDING = 12;
const COLLAPSED_VIEWPORT_CLIP_OFFSET = 16;
const MAX_VISIBLE_ROUTINE_LIST_HEIGHT =
  MAX_VISIBLE_ROUTINES * ROUTINE_VISIBLE_ITEM_HEIGHT +
  ROUTINE_VIEWPORT_BOTTOM_PADDING;
const COLLAPSED_VISIBLE_ROUTINE_LIST_HEIGHT =
  COLLAPSED_VISIBLE_ROUTINES * ROUTINE_VISIBLE_ITEM_HEIGHT +
  ROUTINE_VIEWPORT_BOTTOM_PADDING -
  COLLAPSED_VIEWPORT_CLIP_OFFSET;
const PREVIEW_OVERLAY_TOP_OFFSET = ROUTINE_VISIBLE_ITEM_HEIGHT;
const SECOND_ROUTINE_OVERLAY_HEIGHT =
  COLLAPSED_VISIBLE_ROUTINE_LIST_HEIGHT - PREVIEW_OVERLAY_TOP_OFFSET;
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
              ? styles.listViewportCollapsedHeight
              : null,
            isExpanded ? styles.listViewportExpandedHeight : null,
          ]}
          testID="routine-list-viewport"
        >
          {type === 'number' ? (
            <RoutineCountList
              routines={routines}
              date={date}
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

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.foundation.spacing.s,
    flex: 1,
    backgroundColor: 'transparent',
  },
  listViewport: {
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  listViewportCollapsedHeight: {
    height: COLLAPSED_VISIBLE_ROUTINE_LIST_HEIGHT,
  },
  listViewportExpandedHeight: {
    height: MAX_VISIBLE_ROUTINE_LIST_HEIGHT,
  },
  previewOverlay: {
    position: 'absolute',
    top: PREVIEW_OVERLAY_TOP_OFFSET,
    right: 0,
    left: 0,
    height: SECOND_ROUTINE_OVERLAY_HEIGHT,
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
    marginTop: baseFoundation.spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.dimension.x2,
    borderRadius: 8,
    borderWidth: 1,
    width: 60,
    height: 24,
    borderColor: '#83B0D6',
    backgroundColor: '#B0DAFF',
  },
}));
