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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

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
import { baseFoundation } from '@/theme/tokens';

const SPEECH_BUBBLE_VISIBLE_MS = 3000;
const SPEECH_BUBBLE_FADE_OUT_MS = 300;
const SPEECH_BUBBLE_RESIZE_MS = 180;
const EMPTY_CHARACTER_BOTTOM_INSET_THRESHOLD = baseFoundation.dimension.x20;
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
  const insets = useSafeAreaInsets();
  const isFirstLoadRef = useRef(true);
  const speechBubbleHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const speechBubbleOpacity = useRef(new Animated.Value(0)).current;
  const [routineListAreaHeight, setRoutineListAreaHeight] = useState(0);
  const [isSpeechBubbleVisible, setIsSpeechBubbleVisible] = useState(false);
  const [speechBubbleMessage, setSpeechBubbleMessage] = useState('안녕?');

  const searchParams = useLocalSearchParams();
  const date = (searchParams.date as string) || getWeekMonday(new Date());
  const user = useAuthUser();
  const themeName = useColorScheme();

  const {
    data: routines = [],
    isLoading,
    isRefetching,
    refetch,
  } = useRoutinesQuery(user?.nickname || '', date);
  const hasRoutines = routines.length > 0;
  const mottos = useMemo(() => {
    const normalizedMottos = normalizeMottoText(user?.mottos);

    return normalizedMottos.length
      ? normalizedMottos
      : normalizeMottoText(user?.motto);
  }, [user?.motto, user?.mottos]);
  const emptyCharacterBottomOffset =
    baseFoundation.spacing[5] +
    Math.max(EMPTY_CHARACTER_BOTTOM_INSET_THRESHOLD - insets.bottom, 0);
  const characterAreaBottomPadding = Math.max(
    EMPTY_CHARACTER_BOTTOM_INSET_THRESHOLD - insets.bottom,
    0,
  );

  useEffect(() => {
    if (!isLoading && isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, [isLoading]);

  const showLoading = isLoading && isFirstLoadRef.current;

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleRoutineListAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setRoutineListAreaHeight(event.nativeEvent.layout.height);
    },
    [],
  );

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
        <RoutineHeader date={date} />
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
                    refreshing={isRefetching}
                    onRefresh={handleRefresh}
                  />
                </View>
                <View
                  style={[
                    styles.routineCharacterArea,
                    { paddingBottom: characterAreaBottomPadding },
                  ]}
                  testID="routine-character-area"
                >
                  <View style={styles.characterStage}>
                    <RoutineCharacter onPress={handleCharacterPress} />
                    {isSpeechBubbleVisible && (
                      <Animated.View
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
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.emptyRoutineCharacterArea,
                    { bottom: emptyCharacterBottomOffset },
                  ]}
                  testID="routine-character-area"
                >
                  <RoutineCharacter />
                </View>
                <View style={styles.emptyStateOverlay}>
                  <RoutineList
                    routines={routines}
                    date={date}
                    refreshing={isRefetching}
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
        onPress={() => router.push('/modal?type=routine-add')}
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
  routineCharacterArea: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRoutineCharacterArea: {
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
    bottom: baseFoundation.dimension.x120 + theme.foundation.spacing[1],
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
    backgroundColor: '#0D3154',
    borderWidth: 2,
    borderColor: '#A9D6FF',
    shadowColor: '#0D3154',
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
