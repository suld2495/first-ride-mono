import Ionicons from '@expo/vector-icons/Ionicons';
import { HttpError } from '@repo/shared/api/AppError';
import { useFetchFriendsQuery } from '@repo/shared/hooks/useFriend';
import {
  useRequestRoutineMateChangeMutation,
  useRoutineDetailQuery,
} from '@repo/shared/hooks/useRoutine';
import type { Friend } from '@repo/types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import Select from '@/components/ui/select';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { getApiErrorMessage } from '@/utils/error-utils';
import { canChangeRoutineMate } from '@/utils/routine-mate-change';

const getAccountId = (friend: Friend): number | null => {
  const id = Number(friend.friendId);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export default function RoutineMateChangePage() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ routineId: string }>();
  const parsedId = Number(params.routineId);
  const routineId =
    Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : 0;
  const user = useAuthUser();
  const nickname = user?.nickname ?? '';
  const { showToast } = useToast();
  const routineQuery = useRoutineDetailQuery(routineId);
  const friendsQuery = useFetchFriendsQuery();
  const changeMate = useRequestRoutineMateChangeMutation(nickname);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [now, setNow] = useState(Date.now);
  const submitting = useRef(false);
  const routine = routineQuery.data;
  const pendingRequest = changeMate.data?.request;
  const expiresAt = pendingRequest?.expiresAt
    ? new Date(pendingRequest.expiresAt).getTime()
    : null;
  const isExpired = expiresAt !== null && expiresAt <= now;
  const hasPendingRequest =
    !isExpired && (!!changeMate.data || !!routine?.hasPendingChangeRequest);
  const canChange = !!routine && canChangeRoutineMate(routine, nickname);
  const isBusy = changeMate.isPending;
  const friends = (friendsQuery.data ?? []).filter(
    (friend) =>
      getAccountId(friend) !== null &&
      friend.nickname !== nickname &&
      friend.nickname !== routine?.mateNickname,
  );
  const selectedId = selectedFriend ? getAccountId(selectedFriend) : null;
  const selectedIsAvailable = friends.some(
    (friend) => getAccountId(friend) === selectedId,
  );

  useEffect(() => {
    if (!pendingRequest?.expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [pendingRequest?.expiresAt]);

  const handleRequest = async () => {
    if (
      !canChange ||
      !selectedId ||
      !selectedIsAvailable ||
      hasPendingRequest ||
      submitting.current
    )
      return;
    submitting.current = true;
    try {
      const response = await changeMate.mutateAsync({
        routineId,
        friendId: selectedId,
      });
      showToast(
        response.created
          ? '메이트 변경 요청을 보냈어요.'
          : '같은 메이트에게 보낸 요청이 이미 있어요.',
        response.created ? 'success' : 'info',
      );
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        showToast(
          '대기 중인 다른 변경 요청이 있어요. 기존 요청을 먼저 취소하거나 처리한 뒤 다시 요청해 주세요.',
          'error',
        );
        void routineQuery.refetch();
      } else if (error instanceof HttpError && error.status === 401) {
        showToast('로그인 인증이 만료되었어요. 다시 로그인해 주세요.', 'error');
      } else {
        showToast(
          getApiErrorMessage(
            error,
            '메이트 변경을 요청하지 못했어요. 잠시 후 다시 시도해 주세요.',
          ),
          'error',
        );
      }
    } finally {
      submitting.current = false;
    }
  };

  const canShowForm =
    !!routine && !routineQuery.isError && !routineQuery.isLoading;
  const selectDisabled =
    !canChange ||
    hasPendingRequest ||
    isBusy ||
    friendsQuery.isLoading ||
    friendsQuery.isError ||
    friends.length === 0;

  return (
    <Container noPadding style={styles.container}>
      <PageHeader title="메이트 변경" showBackButton />
      {routineQuery.isLoading ? (
        <Loading />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {routineQuery.isError ? (
            <View style={styles.section}>
              <Typography>루틴 정보를 불러오지 못했어요.</Typography>
              <Button
                onPress={() => {
                  void routineQuery.refetch();
                }}
              >
                다시 시도
              </Button>
            </View>
          ) : !routineId || !routine ? (
            <Typography>루틴을 찾을 수 없어요.</Typography>
          ) : (
            <>
              <View style={styles.routineSummary}>
                {hasPendingRequest ? (
                  <Badge
                    count="요청 중"
                    variant="info"
                    size="lg"
                    style={styles.pendingBadge}
                  />
                ) : null}
                <Typography variant="body2" style={styles.label}>
                  루틴 이름
                </Typography>
                <Typography
                  variant="body1"
                  weight="semibold"
                  style={styles.primaryText}
                >
                  {routine.routineName}
                </Typography>
              </View>
              <View style={styles.mateForm}>
                <View style={styles.fieldGroup}>
                  <Typography variant="body2" style={styles.label}>
                    현재 메이트
                  </Typography>
                  <Typography
                    variant="body1"
                    weight="bold"
                    style={styles.primaryText}
                  >
                    {routine.mateNickname || '메이트 없음'}
                  </Typography>
                </View>
                <View style={styles.divider} />
                <View style={styles.fieldGroup}>
                  <Typography variant="body2" style={styles.label}>
                    새 메이트
                  </Typography>
                  <Select
                    fullWidth
                    showSelectedIndicator={false}
                    size="lg"
                    value={
                      selectedIsAvailable
                        ? (selectedId ?? undefined)
                        : undefined
                    }
                    items={friends.flatMap((friend) => {
                      const id = getAccountId(friend);
                      return id === null
                        ? []
                        : [{ label: friend.nickname, value: id }];
                    })}
                    onSelect={(id) =>
                      setSelectedFriend(
                        friends.find((friend) => getAccountId(friend) === id) ??
                          null,
                      )
                    }
                    placeholder={
                      friendsQuery.isLoading
                        ? '친구 목록을 불러오는 중이에요'
                        : '친구를 선택해 주세요'
                    }
                    disabled={selectDisabled}
                    style={styles.select}
                    textStyle={styles.selectText}
                  />
                  {friendsQuery.isError ? (
                    <View style={styles.section}>
                      <Typography color="error" variant="body3">
                        친구 목록을 불러오지 못했어요.
                      </Typography>
                      <Button
                        variant="ghost"
                        onPress={() => {
                          void friendsQuery.refetch();
                        }}
                      >
                        다시 시도
                      </Button>
                    </View>
                  ) : !friendsQuery.isLoading &&
                    friends.length === 0 &&
                    canChange ? (
                    <Typography color="secondary" variant="body3">
                      선택할 수 있는 다른 친구가 없어요.
                    </Typography>
                  ) : null}
                </View>
              </View>
              <View style={styles.guidance}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="information-circle-outline"
                    size={theme.foundation.iconSize.m}
                    color={theme.colors.action.primary.default}
                  />
                </View>
                <View style={styles.guidanceText}>
                  <Typography
                    variant="body1"
                    weight="bold"
                    style={styles.primaryText}
                  >
                    새 메이트가 승인하면 변경돼요.
                  </Typography>
                  <Typography variant="body3" style={styles.label}>
                    이번 주 벌금은 기존 메이트 기준으로 유지돼요.
                  </Typography>
                </View>
              </View>
              {!canChange ? (
                <Typography>
                  진행 중이며 일시정지되지 않은 내 메이트 루틴에서 변경할 수
                  있어요.
                </Typography>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
      {canShowForm && canChange ? (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(
                insets.bottom,
                theme.foundation.spacing[6],
              ),
            },
          ]}
        >
          <Button
            size="lg"
            fullWidth
            style={styles.submitButton}
            loading={changeMate.isPending}
            disabled={!selectedIsAvailable || !selectedId || selectDisabled}
            onPress={handleRequest}
          >
            메이트 변경 요청
          </Button>
        </View>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { backgroundColor: theme.colors.brand.background },
  content: {
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[6],
    gap: theme.foundation.spacing[6],
  },
  section: { gap: theme.foundation.spacing[3] },
  routineSummary: { gap: theme.foundation.spacing[2] },
  pendingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.foundation.spacing[2],
  },
  primaryText: { color: theme.colors.brand.text },
  label: { color: theme.colors.text.muted },
  mateForm: {
    backgroundColor: theme.colors.field.background,
    borderRadius: theme.foundation.radii.s,
    padding: theme.foundation.spacing[4],
  },
  fieldGroup: { gap: theme.foundation.spacing[2] },
  divider: {
    height: theme.foundation.dimension.x1,
    backgroundColor: theme.colors.brand.background,
    marginVertical: theme.foundation.spacing[5],
  },
  select: {
    height: theme.foundation.dimension.x48,
    borderRadius: theme.foundation.radii.xs,
    borderColor: theme.colors.brand.background,
    backgroundColor: theme.colors.brand.card,
  },
  selectText: {
    color: theme.colors.brand.text,
    fontSize: theme.foundation.typography.size.l,
    fontWeight: theme.foundation.typography.weight.semibold,
  },
  guidance: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.foundation.spacing[3],
    paddingHorizontal: theme.foundation.spacing[2],
  },
  infoIcon: {
    width: theme.foundation.dimension.x32,
    height: theme.foundation.dimension.x32,
    borderRadius: theme.foundation.radii.xl,
    backgroundColor: theme.colors.brand.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceText: {
    flex: 1,
    gap: theme.foundation.spacing[2],
    paddingTop: theme.foundation.spacing[1],
  },
  footer: {
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[3],
  },
  submitButton: {
    minHeight: theme.foundation.dimension.x56,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: theme.foundation.radii.xs,
  },
}));
