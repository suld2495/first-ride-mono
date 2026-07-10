import Ionicons from '@expo/vector-icons/Ionicons';
import { getFormatDate } from '@repo/shared/utils';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';

import {
  getRoutineSceneCharacterAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { FlashList } from '@/components/ui/flash-list';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';
import { useSetRequestId } from '@/hooks/useRequestSelection';
import type { ThemeName } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';

interface RequestListItem {
  id: number;
  routineName: string;
  nickname: string;
  createdAt: string;
}

type RequestListEntry =
  | { id: string; title: string; type: 'header' }
  | { id: string; request: RequestListItem; type: 'request' };

interface RequestRenderItemProps {
  item: RequestListEntry;
}

const getRequestGroupLabel = (createdAt: string) => {
  const requestDate = new Date(createdAt);
  const today = new Date();
  const isToday =
    requestDate.getFullYear() === today.getFullYear() &&
    requestDate.getMonth() === today.getMonth() &&
    requestDate.getDate() === today.getDate();

  return isToday ? '오늘' : '이전 요청';
};

const getCharacterThemeName = (themeName: string): ThemeName => {
  if (
    themeName === 'light' ||
    themeName === 'dark' ||
    themeName === 'blue' ||
    themeName === 'green' ||
    themeName === 'red'
  ) {
    return themeName;
  }

  return 'blue';
};

const mixWithWhite = (hexColor: string, whiteRatio: number) => {
  const match = /^#([\dA-Fa-f]{2})([\dA-Fa-f]{2})([\dA-Fa-f]{2})$/.exec(
    hexColor,
  );

  if (!match) return hexColor;

  const mixChannel = (channel: string) =>
    Math.round(
      Number.parseInt(channel, 16) * (1 - whiteRatio) + 255 * whiteRatio,
    );

  return `rgb(${mixChannel(match[1])}, ${mixChannel(match[2])}, ${mixChannel(match[3])})`;
};

const RequestListModal = () => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const user = useAuthUser();
  const { data: requests } = useReceivedRequests(user?.nickname || '');
  const setRequestId = useSetRequestId();
  const listEntries = useMemo<RequestListEntry[]>(() => {
    const today: RequestListItem[] = [];
    const previous: RequestListItem[] = [];

    for (const request of requests) {
      if (getRequestGroupLabel(request.createdAt) === '오늘') {
        today.push(request);
      } else {
        previous.push(request);
      }
    }

    const entries: RequestListEntry[] = [];
    const appendSection = (
      title: string,
      sectionRequests: RequestListItem[],
    ) => {
      if (!sectionRequests.length) return;

      entries.push({ id: `header-${title}`, title, type: 'header' });
      for (const request of sectionRequests) {
        entries.push({
          id: `request-${request.id}`,
          request,
          type: 'request',
        });
      }
    };

    appendSection('오늘', today);
    appendSection('이전 요청', previous);

    return entries;
  }, [requests]);

  const handleMove = useCallback(
    (requestId: number) => {
      router.push('/modal?type=request-detail');
      setRequestId(requestId);
    },
    [router, setRequestId],
  );

  const renderRequestItem = useCallback(
    ({ item }: RequestRenderItemProps) => {
      if (item.type === 'header') {
        return (
          <ThemeView style={styles.groupHeader} transparent>
            <Typography
              variant="body2"
              weight="semibold"
              style={styles.accentText}
            >
              {item.title}
            </Typography>
          </ThemeView>
        );
      }

      const { request } = item;
      const isLatestRequest = request.id === requests[0]?.id;

      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => handleMove(request.id)}
          style={({ pressed }) => [
            styles.itemContainer,
            isLatestRequest && styles.latestItem,
            pressed && styles.itemPressed,
          ]}
        >
          <ThemeView style={styles.marker} />
          <ThemeView style={styles.itemTextGroup} transparent>
            <Typography
              variant="body1"
              weight="semibold"
              style={styles.itemTitle}
            >
              {request.routineName}
            </Typography>
            <ThemeView style={styles.itemMeta} transparent>
              <Typography variant="caption1" style={styles.itemMetaText}>
                {request.nickname}
              </Typography>
              <Typography variant="caption1" style={styles.itemMetaText}>
                · {getFormatDate(new Date(request.createdAt))}
              </Typography>
            </ThemeView>
          </ThemeView>
          <Ionicons
            color={theme.colors.brand.text}
            name="chevron-forward"
            size={baseFoundation.iconSize.m}
          />
        </Pressable>
      );
    },
    [handleMove, requests, theme.colors.brand.text],
  );

  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.intro} transparent>
        <ThemeView style={styles.titleRow} transparent>
          <Typography variant="h1" weight="bold" style={styles.introTitle}>
            인증 요청
          </Typography>
          <ThemeView style={styles.countBadge}>
            <Typography
              variant="body2"
              weight="semibold"
              style={styles.accentText}
            >
              {requests.length}
            </Typography>
          </ThemeView>
        </ThemeView>
        <ThemeView style={styles.characterSlot} transparent>
          {renderRoutineSceneAsset(
            getRoutineSceneCharacterAsset(getCharacterThemeName(theme.name)),
            {
              testID: 'request-list-character',
              style: styles.character,
            },
          )}
        </ThemeView>
        <Typography variant="body2" style={styles.introDescription}>
          도착한 인증을 확인해 주세요
        </Typography>
      </ThemeView>
      <ThemeView style={styles.listSurface}>
        {requests.length ? (
          // Header and request rows intentionally use different heights.
          // eslint-disable-next-line local-rules/no-flatlist-missing-get-item-layout
          <FlashList
            data={listEntries}
            keyExtractor={({ id }) => id}
            renderItem={renderRequestItem}
            ItemSeparatorComponent={() => (
              <ThemeView style={styles.listSeparator} />
            )}
            contentContainerStyle={styles.list}
            estimatedItemSize={72}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        ) : (
          <ThemeView style={styles.empty} transparent>
            <Typography style={styles.emptyText}>요청이 없습니다.</Typography>
          </ThemeView>
        )}
      </ThemeView>
    </ThemeView>
  );
};

export default RequestListModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },

  intro: {
    position: 'relative',
    minHeight: baseFoundation.dimension.x120,
    paddingHorizontal: baseFoundation.spacing[5],
    paddingTop: baseFoundation.spacing[5],
    paddingRight: baseFoundation.spacing[24],
    paddingBottom: baseFoundation.spacing[4],
    gap: baseFoundation.spacing[2],
  },

  introTitle: {
    color: theme.colors.brand.text,
  },

  introDescription: {
    color: theme.colors.text.muted,
  },

  accentText: {
    color: theme.colors.text.soft,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[2],
  },

  characterSlot: {
    position: 'absolute',
    top: baseFoundation.spacing[4],
    right: baseFoundation.spacing[5],
    width: baseFoundation.dimension.x56,
    height: baseFoundation.dimension.x56,
  },

  character: {
    width: baseFoundation.dimension.x56,
    height: baseFoundation.dimension.x56,
  },

  countBadge: {
    minWidth: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    borderRadius: baseFoundation.radii.s,
    paddingHorizontal: baseFoundation.spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.88),
  },

  list: {
    paddingBottom: baseFoundation.spacing[12],
    flexGrow: 0,
  },

  listSurface: {
    flex: 1,
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.94),
  },

  listSeparator: {
    height: baseFoundation.dimension.x1,
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.86),
  },

  groupHeader: {
    minHeight: baseFoundation.dimension.x52,
    justifyContent: 'center',
    paddingHorizontal: baseFoundation.spacing[5],
    borderBottomWidth: baseFoundation.dimension.x1,
    borderBottomColor: mixWithWhite(theme.colors.action.primary.default, 0.86),
  },

  itemContainer: {
    minHeight: baseFoundation.dimension.x80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: baseFoundation.spacing[5],
    paddingRight: baseFoundation.spacing[5],
    gap: baseFoundation.spacing[5],
    width: '100%',
  },

  itemPressed: {
    opacity: baseFoundation.opacity.medium,
  },

  latestItem: {
    borderLeftWidth: baseFoundation.dimension.x4,
    borderLeftColor: theme.colors.action.primary.default,
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.88),
  },

  marker: {
    width: baseFoundation.dimension.x12,
    height: baseFoundation.dimension.x12,
    borderRadius: baseFoundation.radii.round,
    backgroundColor: theme.colors.action.primary.default,
  },

  itemTextGroup: {
    flex: 1,
  },

  itemTitle: {
    color: theme.colors.brand.text,
  },

  itemMeta: {
    marginTop: baseFoundation.spacing[1],
    flexDirection: 'row',
    gap: baseFoundation.spacing[1],
  },

  itemMetaText: {
    color: theme.colors.text.muted,
  },

  empty: {
    marginTop: baseFoundation.spacing[7],
    alignItems: 'center',
  },

  emptyText: {
    color: theme.colors.brand.text,
  },
}));
