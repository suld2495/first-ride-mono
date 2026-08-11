import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import { useMyStatsQuery } from '@repo/shared/hooks/useStat';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import { getWeekMonday } from '@repo/shared/utils';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type LayoutChangeEvent, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { UpdateNotice } from '@/api/update-notices.api';
import LevelProgressCelebrationModal from '@/components/modal/level-progress-celebration-modal';
import WhatsNewModal from '@/components/modal/whats-new-modal';
import RoutineHeader from '@/components/routine/routine-header';
import RoutineList from '@/components/routine/routine-list';
import {
  getRoutineSceneBackgroundAsset,
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { IconButton } from '@/components/ui/icon-button';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import CharacterMottoSpeechBubble from '@/feature/character/character-motto-speech-bubble';
import RoutineCharacter from '@/feature/character/routine-character';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDebounce } from '@/hooks/useDebounce';
import { useRequiredAppVersionQuery } from '@/hooks/useRequiredAppVersionQuery';
import { useResetRoutineFormState } from '@/hooks/useRoutineFormState';
import { useUpdateNoticesQuery } from '@/hooks/useUpdateNoticesQuery';
import {
  clearRoutineShareTargets,
  syncRoutineShareTargets,
} from '@/share/routine-share';
import { getThemeNameFromUserJob } from '@/theme/job-theme';
import { getRoutineBackgroundColor } from '@/theme/routine-theme';
import { baseFoundation } from '@/theme/tokens';
import {
  createLevelProgressCelebration,
  type LevelProgressCelebration,
  type LevelProgressSnapshot,
} from '@/utils/level-progress-celebration';
import {
  createRoutineWidgetSnapshot,
  createSignedOutRoutineWidgetSnapshot,
} from '@/widget/routine-widget';
import { saveRoutineWidgetSnapshot } from '@/widget/routine-widget-native';

const ROUTINE_CHARACTER_BOTTOM_OFFSET = baseFoundation.dimension.x48;
const ROUTINE_SPEECH_BUBBLE_OVERLAP = baseFoundation.dimension.x44;
const DAYS_PER_WEEK = 7;
const MONDAY = 1;
const WEEKLY_ROLLOVER_HOUR = 0;
const WEEKLY_ROLLOVER_MINUTE = 0;
const WEEKLY_ROLLOVER_SECOND = 0;
const EMPTY_UPDATE_NOTICES: readonly UpdateNotice[] = [];

const getNextWeeklyRollover = (now: Date) => {
  const rollover = new Date(now);
  const daysUntilMonday =
    (MONDAY - rollover.getDay() + DAYS_PER_WEEK) % DAYS_PER_WEEK;

  rollover.setDate(rollover.getDate() + daysUntilMonday);
  rollover.setHours(
    WEEKLY_ROLLOVER_HOUR,
    WEEKLY_ROLLOVER_MINUTE,
    WEEKLY_ROLLOVER_SECOND,
    0,
  );

  if (rollover.getTime() <= now.getTime()) {
    rollover.setDate(rollover.getDate() + DAYS_PER_WEEK);
  }

  return rollover;
};

const normalizeMottoText = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(normalizeMottoText);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return [];
  }

  if (trimmedValue.startsWith('[')) {
    try {
      return normalizeMottoText(JSON.parse(trimmedValue));
    } catch {
      return [trimmedValue];
    }
  }

  return [trimmedValue];
};

export default function Index() {
  const router = useRouter();
  const replaceRoutineRoute = router.replace;
  const resetRoutineForm = useResetRoutineFormState();
  const isFirstLoadRef = useRef(true);
  const previousLevelProgressRef = useRef<LevelProgressSnapshot | null>(null);
  const [routineListAreaHeight, setRoutineListAreaHeight] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [levelProgressCelebration, setLevelProgressCelebration] =
    useState<LevelProgressCelebration | null>(null);

  const searchParams = useLocalSearchParams();
  const date = (searchParams.date as string) || getWeekMonday(new Date());
  const debouncedDate = useDebounce(date);
  const routineDateRef = useRef(date);
  const appStateRef = useRef(AppState.currentState);
  const user = useAuthUser();
  const requiredAppVersionQuery = useRequiredAppVersionQuery(user?.userId);
  const updateNoticesQuery = useUpdateNoticesQuery(user?.userId);
  const whatsNewBuildNumber = requiredAppVersionQuery.isSuccess
    ? (requiredAppVersionQuery.data?.minimumBuildNumber ?? null)
    : null;
  const updateNotices = updateNoticesQuery.isSuccess
    ? updateNoticesQuery.data
    : EMPTY_UPDATE_NOTICES;
  const { data: currentUser } = useFetchMeQuery(user?.userId);
  const { data: myStats } = useMyStatsQuery(user?.userId ?? '');
  const themeName = useColorScheme();
  const userThemeName = currentUser
    ? getThemeNameFromUserJob(currentUser)
    : themeName;
  const routineBackgroundColor = getRoutineBackgroundColor(
    userThemeName,
    currentUser?.evolutionCount,
  );

  const {
    data: routines = [],
    isLoading,
    refetch,
  } = useRoutinesQuery(user?.nickname || '', debouncedDate);
  const hasRoutines = routines.length > 0;
  const routineCharacterAsset = useMemo(
    () => getRoutineSceneRemoteAsset(currentUser?.characterImageUrl),
    [currentUser?.characterImageUrl],
  );
  const routineBackgroundAsset = useMemo(
    () =>
      getRoutineSceneRemoteAsset(currentUser?.backgroundImageUrl) ??
      getRoutineSceneBackgroundAsset(userThemeName),
    [currentUser?.backgroundImageUrl, userThemeName],
  );
  const mottos = useMemo(() => {
    const normalizedMotto = normalizeMottoText(user?.motto);

    return normalizedMotto.length
      ? normalizedMotto
      : normalizeMottoText(user?.mottos);
  }, [user?.motto, user?.mottos]);
  const speechBubbleMessage = mottos[0] ?? '안녕?';

  useLayoutEffect(() => {
    routineDateRef.current = date;
  }, [date]);

  useEffect(() => {
    if (user && !isLoading && isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, [isLoading, user]);

  const showLoading = isLoading && isFirstLoadRef.current;

  useEffect(() => {
    if (!myStats) {
      return;
    }

    const currentSnapshot: LevelProgressSnapshot = {
      currentLevel: myStats.currentLevel,
      evolutionCount: currentUser?.evolutionCount,
    };
    const celebration = createLevelProgressCelebration(
      previousLevelProgressRef.current,
      currentSnapshot,
    );

    previousLevelProgressRef.current = currentSnapshot;

    if (celebration) {
      setLevelProgressCelebration(celebration);
    }
  }, [currentUser?.evolutionCount, myStats]);

  const handleCloseLevelProgressCelebration = useCallback(() => {
    setLevelProgressCelebration(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsManualRefreshing(true);

    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [refetch]);

  const resetRoutineDateIfNeeded = useCallback(() => {
    const currentWeekDate = getWeekMonday(new Date());

    if (routineDateRef.current === currentWeekDate) {
      return false;
    }

    replaceRoutineRoute(
      `/(tabs)/(afterLogin)/(routine)?date=${currentWeekDate}`,
    );
    return true;
  }, [replaceRoutineRoute]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let rolloverTimer: ReturnType<typeof setTimeout>;

    const scheduleWeeklyRollover = () => {
      const now = new Date();
      const nextRollover = getNextWeeklyRollover(now);
      const delay = nextRollover.getTime() - now.getTime();

      rolloverTimer = setTimeout(() => {
        scheduleWeeklyRollover();
        resetRoutineDateIfNeeded();
      }, delay);
    };

    scheduleWeeklyRollover();

    return () => clearTimeout(rolloverTimer);
  }, [resetRoutineDateIfNeeded, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    appStateRef.current = AppState.currentState;

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      const returnedToActive =
        (previousState === 'inactive' || previousState === 'background') &&
        nextState === 'active';

      if (returnedToActive) {
        resetRoutineDateIfNeeded();
      }

      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [resetRoutineDateIfNeeded, user]);

  useFocusEffect(
    useCallback(() => {
      if (!user || isFirstLoadRef.current) {
        return;
      }

      if (resetRoutineDateIfNeeded()) {
        return;
      }

      void refetch();
    }, [refetch, resetRoutineDateIfNeeded, user]),
  );

  const handleRoutineListAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setRoutineListAreaHeight(event.nativeEvent.layout.height);
    },
    [],
  );

  const handleOpenRoutineReorderModal = useCallback(() => {
    router.push(`/modal?type=routine-reorder&date=${routineDateRef.current}`);
  }, [router]);

  const handleOpenRoutineAddModal = useCallback(() => {
    resetRoutineForm();
    router.push('/modal?type=routine-add');
  }, [resetRoutineForm, router]);

  const handleOpenAccountMotto = useCallback(() => {
    router.push('/modal?type=account');
  }, [router]);

  useEffect(() => {
    const snapshot = user
      ? createRoutineWidgetSnapshot(routines, { themeName })
      : createSignedOutRoutineWidgetSnapshot();

    void saveRoutineWidgetSnapshot(snapshot);
    void (user
      ? syncRoutineShareTargets(routines)
      : clearRoutineShareTargets());
  }, [routines, themeName, user]);

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: routineBackgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />
      <View style={styles.scene} pointerEvents="none">
        <View style={styles.backgroundArt} testID="routine-background-art">
          {routineBackgroundAsset
            ? renderRoutineSceneAsset(routineBackgroundAsset, {
                testID: 'routine-scene-background',
                style: styles.backgroundImage,
                resizeMode: 'stretch',
              })
            : null}
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <RoutineHeader
          date={date}
          onPressReorder={
            hasRoutines ? handleOpenRoutineReorderModal : undefined
          }
        />
        {showLoading ? (
          <View style={styles.loadingContainer}>
            <Loading />
          </View>
        ) : (
          <View style={styles.content} testID="routine-content">
            {hasRoutines ? (
              <View
                style={styles.routineListArea}
                onLayout={handleRoutineListAreaLayout}
                testID="routine-list-area"
              >
                <RoutineList
                  routines={routines}
                  date={date}
                  listAreaHeight={routineListAreaHeight || undefined}
                  refreshing={isManualRefreshing}
                  onRefresh={handleRefresh}
                />
              </View>
            ) : (
              <View
                style={styles.emptyStateArea}
                testID="routine-empty-state-area"
              >
                <RoutineList
                  routines={routines}
                  date={date}
                  refreshing={isManualRefreshing}
                  onRefresh={handleRefresh}
                />
              </View>
            )}
            <View style={styles.routineBottomArea} testID="routine-bottom-area">
              <View
                style={styles.routineCharacterArea}
                testID="routine-character-area"
              >
                <View style={styles.characterStage}>
                  <CharacterMottoSpeechBubble
                    isMine
                    message={speechBubbleMessage}
                    onEdit={handleOpenAccountMotto}
                    testID="routine-character-speech-bubble"
                    style={
                      routineCharacterAsset ? styles.speechBubble : undefined
                    }
                  />
                  {routineCharacterAsset ? (
                    <RoutineCharacter asset={routineCharacterAsset} />
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
      <IconButton
        variant="ghost"
        icon={({ size }) => (
          <Ionicons name="add" size={size + 4} color="#FFFFFF" />
        )}
        onPress={handleOpenRoutineAddModal}
        accessibilityLabel="루틴 추가"
        accessibilityRole="button"
        testID="routine-add-fab"
        style={styles.fab}
      />
      <WhatsNewModal
        buildNumber={whatsNewBuildNumber}
        updates={updateNotices}
      />
      <LevelProgressCelebrationModal
        celebration={levelProgressCelebration}
        characterImageUrl={currentUser?.characterImageUrl}
        onClose={handleCloseLevelProgressCelebration}
        themeName={userThemeName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.secondary,
  },
  scene: {
    position: 'absolute',
    top: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    left: baseFoundation.spacing[0],
  },
  backgroundArt: {
    position: 'absolute',
    left: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 680 / 658,
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.foundation.spacing[4],
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
  },
  routineListArea: {
    flex: 1,
    minHeight: 0,
  },
  routineBottomArea: {
    flexShrink: 0,
    alignItems: 'center',
    paddingBottom: ROUTINE_CHARACTER_BOTTOM_OFFSET,
  },
  routineCharacterArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    zIndex: 1,
  },
  emptyStateArea: {
    flex: 1,
    minHeight: 0,
    marginHorizontal: theme.foundation.spacing[4],
  },
  characterStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    marginBottom: -ROUTINE_SPEECH_BUBBLE_OVERLAP,
  },
  fab: {
    position: 'absolute',
    right: theme.foundation.spacing[4],
    bottom: theme.foundation.spacing[5],
    width: baseFoundation.dimension.x60,
    height: baseFoundation.dimension.x60,
    minWidth: baseFoundation.dimension.x60,
    minHeight: baseFoundation.dimension.x60,
    borderRadius: theme.foundation.radii.round,
    backgroundColor: theme.colors.brand.routineBackground,
    borderWidth: 2,
    borderColor: '#A9D6FF',
    shadowColor: theme.colors.brand.routineBackground,
    shadowOffset: {
      width: baseFoundation.dimension.x0,
      height: baseFoundation.dimension.x6,
    },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
}));
