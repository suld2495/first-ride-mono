import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { BackHandler, Pressable, ScrollView, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import GrowthPage from '@/components/onboarding/growth-page';
import MatePage from '@/components/onboarding/mate-page';
import RoutinePage from '@/components/onboarding/routine-page';
import Button from '@/components/ui/button';
import IconButton from '@/components/ui/icon-button';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import Typography from '@/components/ui/typography';
import { fontFamilies } from '@/theme/font-families';

const PAGES = [
  {
    id: 'routine',
    label: '루틴 인증',
    title: '오늘의 작은 실천,\n체크로 남겨요',
    description: '나에게 맞는 인증 방식으로\n매일의 약속을 하나씩 지켜보세요.',
    Content: RoutinePage,
  },
  {
    id: 'mate',
    label: '함께하는 목표',
    title: '함께라서 든든한\n우리의 목표',
    description: '친구를 메이트로 초대하고\n서로의 꾸준함을 응원해보세요.',
    Content: MatePage,
  },
  {
    id: 'growth',
    label: '캐릭터 성장',
    title: '꾸준히 쌓은 하루,\n새로운 모습으로',
    description:
      '루틴과 퀘스트로 경험치를 쌓으면\n캐릭터도 새로운 모습으로 자라나요.',
    Content: GrowthPage,
  },
] as const;

interface OnboardingScreenProps {
  onComplete: () => void;
  onClose: () => void;
  isCompleting: boolean;
  isReplay: boolean;
  error: string | null;
}

export default function OnboardingScreen({
  onComplete,
  onClose,
  isCompleting,
  isReplay,
  error,
}: OnboardingScreenProps) {
  const { theme } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const pager = useRef<ScrollView>(null);
  const currentPage = useRef(0);
  const [page, setPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const isLastPage = page === PAGES.length - 1;

  const goToPage = useCallback(
    (nextPage: number) => {
      const boundedPage = Math.max(0, Math.min(nextPage, PAGES.length - 1));
      currentPage.current = boundedPage;
      setPage(boundedPage);
      pager.current?.scrollTo({
        x: boundedPage * pageWidth,
        animated: !reducedMotion,
      });
    },
    [pageWidth, reducedMotion],
  );

  useEffect(() => {
    pager.current?.scrollTo({
      x: currentPage.current * pageWidth,
      animated: false,
    });
  }, [pageWidth]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isCompleting) return true;
          if (page === 0) return !isReplay;
          goToPage(page - 1);
          return true;
        },
      );
      return () => subscription.remove();
    }, [goToPage, isCompleting, isReplay, page]),
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setPageWidth(event.nativeEvent.layout.width);
    setPageHeight(event.nativeEvent.layout.height);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    const nextPage = Math.max(
      0,
      Math.min(
        Math.round(event.nativeEvent.contentOffset.x / pageWidth),
        PAGES.length - 1,
      ),
    );
    currentPage.current = nextPage;
    setPage(nextPage);
  };

  return (
    <ThemeView style={styles.root}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View style={styles.screen}>
          <View style={styles.header}>
            <Typography
              variant="title"
              weight="bold"
              color={theme.colors.text.pageHeaderTitle}
            >
              이루라
            </Typography>
            {isReplay ? (
              <IconButton
                accessibilityRole="button"
                accessibilityLabel="앱 사용 안내 닫기"
                disabled={isCompleting}
                onPress={onClose}
                size="lg"
                variant="ghost"
                icon={({ size }) => (
                  <Ionicons
                    name="close-outline"
                    size={size}
                    color={theme.colors.text.gray}
                  />
                )}
              />
            ) : null}
          </View>

          <View style={styles.pager} onLayout={handleLayout}>
            {pageWidth > 0 ? (
              <ScrollView
                ref={pager}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEnabled={!isCompleting}
                style={styles.pager}
              >
                {/* 고정된 3페이지는 가상화 목록 대신 네이티브 스와이프 페이징을 사용해요. */}
                {/* eslint-disable-next-line local-rules/no-scrollview-map-render */}
                {PAGES.map(({ id, title, description, Content }, index) => (
                  <View
                    key={id}
                    style={{ width: pageWidth, height: pageHeight }}
                    accessibilityElementsHidden={page !== index}
                    aria-hidden={page !== index}
                    importantForAccessibility={
                      page === index ? 'auto' : 'no-hide-descendants'
                    }
                  >
                    <ScrollView
                      style={styles.pager}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.pageContent}
                      bounces={false}
                    >
                      <View style={styles.intro}>
                        <Typography
                          accessibilityRole="header"
                          variant="h2"
                          weight="bold"
                          style={styles.title}
                          textAlign="center"
                          color={theme.colors.text.title}
                        >
                          {title}
                        </Typography>
                        <Typography
                          variant="body3"
                          color={theme.colors.text.label}
                          textAlign="center"
                        >
                          {description}
                        </Typography>
                      </View>
                      <Content />
                    </ScrollView>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>

          <ThemeView style={styles.footer}>
            <View style={styles.pagination}>
              {PAGES.map((item, index) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${PAGES.length}페이지 중 ${index + 1}페이지, ${item.label}`}
                  accessibilityState={{ selected: page === index }}
                  disabled={isCompleting}
                  onPress={() => goToPage(index)}
                  style={styles.dotTarget}
                >
                  <View
                    style={[styles.dot, page === index && styles.activeDot]}
                  />
                </Pressable>
              ))}
            </View>
            {error ? (
              <Typography
                accessibilityRole="alert"
                variant="caption1"
                color="error"
                textAlign="center"
              >
                {error}
              </Typography>
            ) : null}
            <Button
              accessibilityRole="button"
              size="lg"
              variant="primary"
              fullWidth
              textStyle={
                isLastPage && isReplay ? styles.confirmButtonText : undefined
              }
              loading={isCompleting}
              onPress={isLastPage ? onComplete : () => goToPage(page + 1)}
            >
              {isLastPage
                ? isReplay
                  ? '확인했어요'
                  : '이루라 시작하기'
                : '다음'}
            </Button>
          </ThemeView>
        </View>
      </SafeAreaView>
    </ThemeView>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: theme.foundation.breakpoints.sm,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.foundation.spacing[6],
    minHeight: theme.foundation.dimension.x60,
  },
  pager: { flex: 1 },
  pageContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[8],
    paddingBottom: theme.foundation.spacing[6],
    gap: theme.foundation.spacing[8],
  },
  intro: { gap: theme.foundation.spacing[5], alignItems: 'center' },
  title: {
    lineHeight:
      theme.foundation.typography.size.h2 *
      theme.foundation.typography.lineHeight.normal,
  },
  footer: {
    paddingHorizontal: theme.foundation.spacing[6],
    paddingBottom: theme.foundation.spacing[6],
    gap: theme.foundation.spacing[2],
  },
  confirmButtonText: {
    fontFamily: fontFamilies.semibold,
    fontSize: 15,
  },
  pagination: { flexDirection: 'row', justifyContent: 'center' },
  dotTarget: {
    width: theme.foundation.dimension.x28,
    height: theme.foundation.dimension.x44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: theme.foundation.dimension.x8,
    height: theme.foundation.dimension.x8,
    borderRadius: theme.foundation.radii.round,
    backgroundColor: theme.colors.border.strong,
  },
  activeDot: {
    backgroundColor: theme.colors.action.primary.default,
  },
}));
