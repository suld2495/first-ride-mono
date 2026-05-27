import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import { getWeekMonday } from '@repo/shared/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  type LayoutChangeEvent,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RoutineHeader from '@/components/routine/routine-header';
import RoutineList from '@/components/routine/routine-list';
import {
  getRoutineSceneBackgroundAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { IconButton } from '@/components/ui/icon-button';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import CharacterSpeechBubble from '@/feature/character/character-speech-bubble';
import RoutineCharacter from '@/feature/character/routine-character';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResetRoutineFormState } from '@/hooks/useRoutineFormState';
import { baseFoundation } from '@/theme/tokens';
import {
  createRoutineWidgetSnapshot,
  createSignedOutRoutineWidgetSnapshot,
} from '@/widget/routine-widget';
import { saveRoutineWidgetSnapshot } from '@/widget/routine-widget-native';

const SPEECH_BUBBLE_VISIBLE_MS = 3000;
const SPEECH_BUBBLE_FADE_OUT_MS = 300;
const SPEECH_BUBBLE_RESIZE_MS = 180;
const SPEECH_BUBBLE_BOTTOM_OFFSET =
  baseFoundation.dimension.x100 + baseFoundation.spacing[1];
const ROUTINE_CHARACTER_BOTTOM_OFFSET = baseFoundation.dimension.x48;
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

const getRandomMotto = (mottos: string[]): string => {
  const randomIndex = Math.floor(Math.random() * mottos.length);

  return mottos[randomIndex] ?? '안녕?';
};

export default function Index() {
  const router = useRouter();
  const resetRoutineForm = useResetRoutineFormState();
  const isFirstLoadRef = useRef(true);
  const speechBubbleHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const speechBubbleOpacity = useRef(new Animated.Value(0)).current;
  const [routineListAreaHeight, setRoutineListAreaHeight] = useState(0);
  const [isSpeechBubbleVisible, setIsSpeechBubbleVisible] = useState(false);
  const [speechBubbleMessage, setSpeechBubbleMessage] = useState('안녕?');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const searchParams = useLocalSearchParams();
  const date = (searchParams.date as string) || getWeekMonday(new Date());
  const user = useAuthUser();
  const themeName = useColorScheme();

  const {
    data: routines = [],
    isLoading,
    refetch,
  } = useRoutinesQuery(user?.nickname || '', date);
  const hasRoutines = routines.length > 0;
  const mottos = useMemo(() => {
    const normalizedMottos = normalizeMottoText(user?.mottos);

    return normalizedMottos.length
      ? normalizedMottos
      : normalizeMottoText(user?.motto);
  }, [user?.motto, user?.mottos]);
  const routineCharacterBottomOffset = ROUTINE_CHARACTER_BOTTOM_OFFSET;

  useEffect(() => {
    if (!isLoading && isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, [isLoading]);

  const showLoading = isLoading && isFirstLoadRef.current;

  const handleRefresh = useCallback(async () => {
    setIsManualRefreshing(true);

    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [refetch]);

  const handleRoutineListAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setRoutineListAreaHeight(event.nativeEvent.layout.height);
    },
    [],
  );

  const handleOpenRoutineReorderModal = useCallback(() => {
    router.push(`/modal?type=routine-reorder&date=${date}`);
  }, [date, router]);

  const handleOpenRoutineAddModal = useCallback(() => {
    resetRoutineForm();
    router.push('/modal?type=routine-add');
  }, [resetRoutineForm, router]);

  const handleCharacterPress = useCallback(() => {
    if (speechBubbleHideTimerRef.current) {
      clearTimeout(speechBubbleHideTimerRef.current);
    }

    speechBubbleOpacity.stopAnimation();
    speechBubbleOpacity.setValue(1);
    LayoutAnimation.configureNext({
      duration: SPEECH_BUBBLE_RESIZE_MS,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    setSpeechBubbleMessage(mottos.length ? getRandomMotto(mottos) : '안녕?');
    setIsSpeechBubbleVisible(true);

    speechBubbleHideTimerRef.current = setTimeout(() => {
      Animated.timing(speechBubbleOpacity, {
        toValue: 0,
        duration: SPEECH_BUBBLE_FADE_OUT_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsSpeechBubbleVisible(false);
        }
      });
    }, SPEECH_BUBBLE_VISIBLE_MS);
  }, [mottos, speechBubbleOpacity]);

  useEffect(
    () => () => {
      if (speechBubbleHideTimerRef.current) {
        clearTimeout(speechBubbleHideTimerRef.current);
      }
      speechBubbleOpacity.stopAnimation();
    },
    [speechBubbleOpacity],
  );

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [router, user]);

  useEffect(() => {
    const snapshot = user
      ? createRoutineWidgetSnapshot(routines, { themeName })
      : createSignedOutRoutineWidgetSnapshot();

    void saveRoutineWidgetSnapshot(snapshot);
  }, [routines, themeName, user]);

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.scene} pointerEvents="none">
        <View style={styles.backgroundArt} testID="routine-background-art">
          {renderRoutineSceneAsset(getRoutineSceneBackgroundAsset(themeName), {
            testID: 'routine-scene-background',
            style: styles.backgroundImage,
            resizeMode: 'stretch',
          })}
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
              <>
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
                <View
                  style={[
                    styles.routineCharacterArea,
                    { bottom: routineCharacterBottomOffset },
                  ]}
                  testID="routine-character-area"
                >
                  <View style={styles.characterStage}>
                    <RoutineCharacter onPress={handleCharacterPress} />
                    {isSpeechBubbleVisible && (
                      <Animated.View
                        testID="routine-character-speech-bubble"
                        style={[
                          styles.speechBubble,
                          { opacity: speechBubbleOpacity },
                        ]}
                        pointerEvents="none"
                      >
                        <CharacterSpeechBubble message={speechBubbleMessage} />
                      </Animated.View>
                    )}
                  </View>
                </View>
                <View
                  style={styles.routineBottomSpacer}
                  testID="routine-bottom-spacer"
                />
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.routineCharacterArea,
                    { bottom: routineCharacterBottomOffset },
                  ]}
                  testID="routine-character-area"
                >
                  <RoutineCharacter />
                </View>
                <View style={styles.emptyStateOverlay}>
                  <RoutineList
                    routines={routines}
                    date={date}
                    refreshing={isManualRefreshing}
                    onRefresh={handleRefresh}
                  />
                </View>
              </>
            )}
          </View>
        )}
      </View>
      <IconButton
        variant="ghost"
        icon={({ size }) => (
          <Ionicons name="add" size={size + 8} color="#FFFFFF" />
        )}
        onPress={handleOpenRoutineAddModal}
        accessibilityLabel="루틴 추가"
        accessibilityRole="button"
        testID="routine-add-fab"
        style={styles.fab}
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
    flex: 7,
  },
  routineBottomSpacer: {
    flex: 3,
  },
  routineCharacterArea: {
    position: 'absolute',
    right: theme.foundation.spacing[4],
    left: theme.foundation.spacing[4],
    alignItems: 'center',
  },
  emptyStateOverlay: {
    position: 'absolute',
    top: baseFoundation.spacing[0],
    right: theme.foundation.spacing[4],
    left: theme.foundation.spacing[4],
    height: '48%',
  },
  characterStage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  speechBubble: {
    bottom: SPEECH_BUBBLE_BOTTOM_OFFSET,
    position: 'absolute',
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
