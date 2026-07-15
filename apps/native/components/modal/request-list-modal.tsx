import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useApproveRoutineChangeRequestMutation,
  useReceivedRoutineChangeRequestsQuery,
  useRejectRoutineChangeRequestMutation,
} from '@repo/shared/hooks/useRoutine';
import { getFormatDate } from '@repo/shared/utils';
import type { RoutineChangeRequest } from '@repo/types';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';

import RoutineChangeRequestRow, {
  toRoutineChangeRequestListItem,
} from '@/components/modal/routine-change-request-row';
import {
  getRoutineSceneCharacterAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { FlashList } from '@/components/ui/flash-list';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';
import { useSetRequestId } from '@/hooks/useRequestSelection';
import type { ThemeName } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

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

type RequestTab = 'confirmation' | 'routine-change';

interface RoutineChangeRequestRenderItemProps {
  item: RoutineChangeRequest;
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

interface RequestListSurfaceProps {
  activeTab: RequestTab;
  expandedRoutineChangeRequestId: number | null | undefined;
  isRoutineChangeError: boolean;
  isRoutineChangeLoading: boolean;
  listEntries: RequestListEntry[];
  onRetryRoutineChangeRequests: () => void;
  renderRequestItem: (props: RequestRenderItemProps) => ReactElement;
  renderRoutineChangeRequest: (
    props: RoutineChangeRequestRenderItemProps,
  ) => ReactElement;
  requestsCount: number;
  routineChangeRequests: RoutineChangeRequest[];
}

interface EmptyRequestListProps {
  message: string;
}

const EmptyRequestList = ({ message }: EmptyRequestListProps) => (
  <ThemeView style={styles.empty} transparent>
    <Typography style={styles.emptyText}>{message}</Typography>
  </ThemeView>
);

const RequestListSurface = ({
  activeTab,
  expandedRoutineChangeRequestId,
  isRoutineChangeError,
  isRoutineChangeLoading,
  listEntries,
  onRetryRoutineChangeRequests,
  renderRequestItem,
  renderRoutineChangeRequest,
  requestsCount,
  routineChangeRequests,
}: RequestListSurfaceProps) => {
  if (activeTab === 'confirmation') {
    if (!requestsCount) {
      return <EmptyRequestList message="요청이 없습니다." />;
    }

    return (
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
    );
  }

  if (isRoutineChangeLoading) {
    return <EmptyRequestList message="요청을 불러오는 중입니다." />;
  }

  if (isRoutineChangeError) {
    return (
      <ThemeView style={styles.empty} transparent>
        <Typography style={styles.emptyText}>
          요청을 불러오지 못했습니다.
        </Typography>
        <Pressable
          accessibilityLabel="다시 시도"
          accessibilityRole="button"
          onPress={onRetryRoutineChangeRequests}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.itemPressed,
          ]}
        >
          <Typography
            variant="body2"
            weight="semibold"
            style={styles.retryButtonText}
          >
            다시 시도
          </Typography>
        </Pressable>
      </ThemeView>
    );
  }

  if (!routineChangeRequests.length) {
    return <EmptyRequestList message="요청이 없습니다." />;
  }

  return (
    // Expanded and collapsed rows intentionally use different heights.
    // eslint-disable-next-line local-rules/no-flatlist-missing-get-item-layout
    <FlashList
      data={routineChangeRequests}
      estimatedItemSize={168}
      extraData={expandedRoutineChangeRequestId}
      keyExtractor={({ id }) => `routine-change-${id}`}
      renderItem={renderRoutineChangeRequest}
      contentContainerStyle={styles.changeRequestList}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};

const RequestListModal = () => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const user = useAuthUser();
  const nickname = user?.nickname ?? '';
  const { data: requests } = useReceivedRequests(nickname);
  const routineChangeQuery = useReceivedRoutineChangeRequestsQuery(nickname);
  const approveRoutineChangeRequest =
    useApproveRoutineChangeRequestMutation(nickname);
  const rejectRoutineChangeRequest =
    useRejectRoutineChangeRequestMutation(nickname);
  const { showToast } = useToast();
  const setRequestId = useSetRequestId();
  const [activeTab, setActiveTab] = useState<RequestTab>('confirmation');
  const [expandedRoutineChangeRequestId, setExpandedRoutineChangeRequestId] =
    useState<number | null>();
  const routineChangeRequests = useMemo(
    () => routineChangeQuery.data ?? [],
    [routineChangeQuery.data],
  );
  const totalRequestCount = requests.length + routineChangeRequests.length;
  const resolvingRoutineChangeRequestId = approveRoutineChangeRequest.isPending
    ? approveRoutineChangeRequest.variables?.changeRequestId
    : rejectRoutineChangeRequest.isPending
      ? rejectRoutineChangeRequest.variables?.changeRequestId
      : undefined;

  useEffect(() => {
    if (!routineChangeQuery.data) return;

    setExpandedRoutineChangeRequestId((currentRequestId) => {
      if (currentRequestId === undefined) {
        return routineChangeQuery.data.at(-1)?.id ?? null;
      }

      if (
        currentRequestId !== null &&
        !routineChangeQuery.data.some(
          (request) => request.id === currentRequestId,
        )
      ) {
        return null;
      }

      return currentRequestId;
    });
  }, [routineChangeQuery.data]);
  const tabs = useMemo(
    () => [
      {
        count: requests.length,
        id: 'confirmation' as const,
        label: '인증 요청',
      },
      {
        count: routineChangeRequests.length,
        id: 'routine-change' as const,
        label: '루틴 수정',
      },
    ],
    [requests.length, routineChangeRequests.length],
  );
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

  const handleToggleRoutineChangeRequest = useCallback((requestId: number) => {
    setExpandedRoutineChangeRequestId((currentRequestId) =>
      currentRequestId === requestId ? null : requestId,
    );
  }, []);

  const handleApproveRoutineChangeRequest = useCallback(
    (requestId: number) => {
      const request = routineChangeRequests.find(
        (routineChangeRequest) => routineChangeRequest.id === requestId,
      );

      if (!request) return;

      approveRoutineChangeRequest.mutate(
        {
          changeRequestId: requestId,
          routineId: request.routineId,
        },
        {
          onSuccess: () => {
            showToast('루틴 수정 요청을 승인했습니다.', 'success');
          },
          onError: (error) => {
            showToast(
              getApiErrorMessage(
                error,
                '루틴 수정 요청 승인에 실패했습니다. 다시 시도해주세요.',
              ),
              'error',
            );
          },
        },
      );
    },
    [approveRoutineChangeRequest, routineChangeRequests, showToast],
  );

  const handleRejectRoutineChangeRequest = useCallback(
    (requestId: number) => {
      rejectRoutineChangeRequest.mutate(
        { changeRequestId: requestId },
        {
          onSuccess: () => {
            showToast('루틴 수정 요청을 거절했습니다.', 'success');
          },
          onError: (error) => {
            showToast(
              getApiErrorMessage(
                error,
                '루틴 수정 요청 거절에 실패했습니다. 다시 시도해주세요.',
              ),
              'error',
            );
          },
        },
      );
    },
    [rejectRoutineChangeRequest, showToast],
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

  const renderRoutineChangeRequest = useCallback(
    ({ item }: RoutineChangeRequestRenderItemProps) => (
      <RoutineChangeRequestRow
        isExpanded={expandedRoutineChangeRequestId === item.id}
        isResolving={resolvingRoutineChangeRequestId !== undefined}
        onApprove={handleApproveRoutineChangeRequest}
        onReject={handleRejectRoutineChangeRequest}
        onToggle={handleToggleRoutineChangeRequest}
        request={toRoutineChangeRequestListItem(item)}
      />
    ),
    [
      expandedRoutineChangeRequestId,
      handleApproveRoutineChangeRequest,
      handleRejectRoutineChangeRequest,
      handleToggleRoutineChangeRequest,
      resolvingRoutineChangeRequestId,
    ],
  );

  const handleRetryRoutineChangeRequests = useCallback(() => {
    void routineChangeQuery.refetch();
  }, [routineChangeQuery]);

  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.intro} transparent>
        <ThemeView style={styles.titleRow} transparent>
          <Typography variant="h1" weight="bold" style={styles.introTitle}>
            받은 요청
          </Typography>
          <ThemeView style={styles.countBadge}>
            <Typography
              variant="body2"
              weight="semibold"
              style={styles.accentText}
            >
              {totalRequestCount}
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
          도착한 요청을 확인해 주세요
        </Typography>
      </ThemeView>
      <ThemeView style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Pressable
              key={tab.id}
              accessibilityLabel={`${tab.label} ${tab.count}건`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => setActiveTab(tab.id)}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              <ThemeView style={styles.tabContent} transparent>
                <Typography
                  variant="body1"
                  weight="semibold"
                  style={isActive ? styles.activeTabLabel : styles.tabLabel}
                >
                  {tab.label}
                </Typography>
                <ThemeView
                  style={[
                    styles.tabCountBadge,
                    isActive && styles.activeTabCountBadge,
                  ]}
                >
                  <Typography
                    variant="caption1"
                    weight="semibold"
                    style={
                      isActive ? styles.activeTabCountText : styles.tabCountText
                    }
                  >
                    {tab.count}
                  </Typography>
                </ThemeView>
              </ThemeView>
              {isActive ? <ThemeView style={styles.tabIndicator} /> : null}
            </Pressable>
          );
        })}
      </ThemeView>
      <ThemeView style={styles.listSurface}>
        <RequestListSurface
          activeTab={activeTab}
          expandedRoutineChangeRequestId={expandedRoutineChangeRequestId}
          isRoutineChangeError={routineChangeQuery.isError}
          isRoutineChangeLoading={routineChangeQuery.isLoading}
          listEntries={listEntries}
          onRetryRoutineChangeRequests={handleRetryRoutineChangeRequests}
          renderRequestItem={renderRequestItem}
          renderRoutineChangeRequest={renderRoutineChangeRequest}
          requestsCount={requests.length}
          routineChangeRequests={routineChangeRequests}
        />
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

  changeRequestList: {
    paddingBottom: baseFoundation.spacing[12],
  },

  tabBar: {
    minHeight: baseFoundation.dimension.x52,
    flexDirection: 'row',
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.98),
    borderBottomWidth: baseFoundation.dimension.x1,
    borderBottomColor: mixWithWhite(theme.colors.action.primary.default, 0.86),
  },

  tab: {
    position: 'relative',
    minHeight: baseFoundation.dimension.x52,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabPressed: {
    opacity: baseFoundation.opacity.medium,
  },

  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[2],
  },

  tabLabel: {
    color: theme.colors.brand.text,
  },

  activeTabLabel: {
    color: theme.colors.action.primary.default,
  },

  tabCountBadge: {
    minWidth: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    borderRadius: baseFoundation.radii.s,
    paddingHorizontal: baseFoundation.spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.94),
  },

  activeTabCountBadge: {
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.88),
  },

  tabCountText: {
    color: theme.colors.text.muted,
  },

  activeTabCountText: {
    color: theme.colors.action.primary.default,
  },

  tabIndicator: {
    position: 'absolute',
    right: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    left: baseFoundation.spacing[0],
    height: baseFoundation.dimension.x2,
    backgroundColor: theme.colors.action.primary.default,
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

  retryButton: {
    minHeight: baseFoundation.dimension.x40,
    marginTop: baseFoundation.spacing[3],
    borderRadius: baseFoundation.radii.s,
    justifyContent: 'center',
    paddingHorizontal: baseFoundation.spacing[4],
    backgroundColor: theme.colors.action.primary.default,
  },

  retryButtonText: {
    color: theme.colors.action.primary.label,
  },
}));
