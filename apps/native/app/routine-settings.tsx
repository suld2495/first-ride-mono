import {
  useAllRoutinesQuery,
  useDeleteRoutineMutation,
  useUpdateRoutinePauseMutation,
  useUpdateRoutineVisibilityMutation,
} from '@repo/shared/hooks/useRoutine';
import type { Routine } from '@repo/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { RoutineContextMenuPanel } from '@/components/routine/routine-context-menu';
import Checkbox from '@/components/ui/checkbox';
import EmptyState from '@/components/ui/empty-state';
import { FlashList } from '@/components/ui/flash-list';
import Loading from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import {
  useSetRoutineForm,
  useSetRoutineId,
} from '@/hooks/useRoutineSelection';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

type RoutineStatusFilter = 'active' | 'done' | 'upcoming';

const ROUTINE_ROW_HEIGHT = baseFoundation.dimension.x44;

const STATUS_FILTERS: Array<{
  key: RoutineStatusFilter;
  label: string;
  testID: string;
}> = [
  { key: 'active', label: '진행 중', testID: 'routine-status-filter-active' },
  { key: 'done', label: '완료', testID: 'routine-status-filter-done' },
  {
    key: 'upcoming',
    label: '진행 전',
    testID: 'routine-status-filter-upcoming',
  },
];

const getThemePalette90 = (themeName?: string): string => {
  if (themeName === 'green') {
    return palette.theme.green[90];
  }

  if (themeName === 'red') {
    return palette.theme.red[90];
  }

  return palette.theme.blue[90];
};

const getSoftThemePalette40 = (themeName?: string): string => {
  if (themeName === 'green') {
    return palette.theme.softGreen[40];
  }

  if (themeName === 'red') {
    return palette.theme.softRed[40];
  }

  return palette.theme.softBlue[40];
};

interface RoutineListMoreIconProps {
  color: string;
  routineId: Routine['routineId'];
}

const RoutineListMoreIcon = ({
  color,
  routineId,
}: RoutineListMoreIconProps) => (
  <Svg
    width={3}
    height={14}
    viewBox="0 0 3 14"
    fill="none"
    testID={`routine-settings-routine-icon-${routineId}`}
  >
    <Path
      d="M1.45829 7.29297C1.861 7.29297 2.18746 6.96651 2.18746 6.5638C2.18746 6.16109 1.861 5.83464 1.45829 5.83464C1.05559 5.83464 0.729126 6.16109 0.729126 6.5638C0.729126 6.96651 1.05559 7.29297 1.45829 7.29297Z"
      stroke={color}
      strokeWidth={1.45833}
      strokeLinecap="round"
      strokeLinejoin="round"
      testID={`routine-settings-routine-icon-path-${routineId}-middle`}
    />
    <Path
      d="M1.45829 2.1888C1.861 2.1888 2.18746 1.86234 2.18746 1.45964C2.18746 1.05693 1.861 0.730469 1.45829 0.730469C1.05559 0.730469 0.729126 1.05693 0.729126 1.45964C0.729126 1.86234 1.05559 2.1888 1.45829 2.1888Z"
      stroke={color}
      strokeWidth={1.45833}
      strokeLinecap="round"
      strokeLinejoin="round"
      testID={`routine-settings-routine-icon-path-${routineId}-top`}
    />
    <Path
      d="M1.45829 12.3971C1.861 12.3971 2.18746 12.0707 2.18746 11.668C2.18746 11.2653 1.861 10.9388 1.45829 10.9388C1.05559 10.9388 0.729126 11.2653 0.729126 11.668C0.729126 12.0707 1.05559 12.3971 1.45829 12.3971Z"
      stroke={color}
      strokeWidth={1.45833}
      strokeLinecap="round"
      strokeLinejoin="round"
      testID={`routine-settings-routine-icon-path-${routineId}-bottom`}
    />
  </Svg>
);

interface RoutineStatusIconProps {
  color: string;
  routineId: Routine['routineId'];
}

const RoutineHiddenIcon = ({ color, routineId }: RoutineStatusIconProps) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    testID={`routine-settings-routine-hidden-icon-${routineId}`}
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.9107 1.91205C2.23614 1.58661 2.76378 1.58661 3.08921 1.91205L18.0892 16.912C18.4147 17.2375 18.4147 17.7651 18.0892 18.0906C17.7638 18.416 17.2361 18.416 16.9107 18.0906L1.9107 3.09056C1.58527 2.76512 1.58527 2.23748 1.9107 1.91205Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.95756 5.47074C5.76861 5.59075 5.58574 5.71511 5.40936 5.84201C4.15024 6.74788 3.15006 7.83484 2.53351 8.58341C1.84967 9.41366 1.84967 10.5889 2.53351 11.4192C3.15006 12.1678 4.15024 13.2547 5.40936 14.1606C6.66189 15.0617 8.24183 15.8346 10.0001 15.8346C11.7584 15.8346 13.3383 15.0617 14.5909 14.1606C14.6018 14.1527 14.6128 14.1448 14.6237 14.1369L12.5885 12.1017C11.9773 12.8539 11.0448 13.3346 9.99996 13.3346C8.15901 13.3346 6.66663 11.8423 6.66663 10.0013C6.66663 8.9565 7.14732 8.02397 7.89961 7.4128L5.95756 5.47074ZM13.3022 10.4584C13.3227 10.3089 13.3333 10.1564 13.3333 10.0013C13.3333 8.16035 11.8409 6.66797 9.99996 6.66797C9.8449 6.66797 9.69231 6.67856 9.54288 6.69905L7.96016 5.11632C7.74831 4.90448 7.82325 4.54579 8.10988 4.4586C8.70981 4.27609 9.34248 4.16797 10.0001 4.16797C11.7584 4.16797 13.3383 4.94086 14.5909 5.84201C15.85 6.74789 16.8501 7.83484 17.4667 8.58341C18.1505 9.41366 18.1505 10.5889 17.4667 11.4192C17.1449 11.8099 16.7186 12.2928 16.2055 12.794C16.0452 12.9506 15.7893 12.9455 15.6309 12.787L13.3022 10.4584ZM9.09094 8.60413C8.63481 8.9015 8.33329 9.41619 8.33329 10.0013C8.33329 10.9218 9.07948 11.668 9.99996 11.668C10.5851 11.668 11.0998 11.3665 11.3971 10.9103L9.09094 8.60413Z"
      fill={color}
    />
  </Svg>
);

const RoutinePausedIcon = ({ color, routineId }: RoutineStatusIconProps) => (
  <Svg
    width={17}
    height={17}
    viewBox="0 0 17 17"
    fill="none"
    testID={`routine-settings-routine-paused-icon-${routineId}`}
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.33333 0C3.73096 0 0 3.73096 0 8.33333C0 12.9357 3.73096 16.6667 8.33333 16.6667C12.9357 16.6667 16.6667 12.9357 16.6667 8.33333C16.6667 3.73096 12.9357 0 8.33333 0ZM6.66667 5.83333C7.1269 5.83333 7.5 6.20643 7.5 6.66667V10C7.5 10.4602 7.1269 10.8333 6.66667 10.8333C6.20643 10.8333 5.83333 10.4602 5.83333 10V6.66667C5.83333 6.20643 6.20643 5.83333 6.66667 5.83333ZM10 5.83333C10.4602 5.83333 10.8333 6.20643 10.8333 6.66667V10C10.8333 10.4602 10.4602 10.8333 10 10.8333C9.53976 10.8333 9.16667 10.4602 9.16667 10V6.66667C9.16667 6.20643 9.53976 5.83333 10 5.83333Z"
      fill={color}
    />
  </Svg>
);

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getRoutineStatus = (routine: Routine): RoutineStatusFilter => {
  const today = formatDateKey(new Date());

  if (routine.startDate > today) {
    return 'upcoming';
  }

  if (routine.endDate && routine.endDate < today) {
    return 'done';
  }

  return 'active';
};

const getRoutineItemLayout = (_data: Routine[] | null, index: number) => ({
  length: ROUTINE_ROW_HEIGHT,
  offset: ROUTINE_ROW_HEIGHT * index,
  index,
});

export default function RoutineSettingsPage() {
  const user = useAuthUser();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const setRoutineId = useSetRoutineId();
  const setRoutineForm = useSetRoutineForm();
  const { data: routines = [], isLoading } = useAllRoutinesQuery(
    user?.nickname || '',
  );
  const [selectedStatus, setSelectedStatus] =
    useState<RoutineStatusFilter>('active');
  const [showsPausedRoutines, setShowsPausedRoutines] = useState(true);
  const [showsHiddenRoutines, setShowsHiddenRoutines] = useState(true);
  const [openMenuRoutineId, setOpenMenuRoutineId] = useState<
    Routine['routineId'] | null
  >(null);
  const checkboxLabelColor = getThemePalette90(theme.name);
  const routineMoreIconColor = getSoftThemePalette40(theme.name);
  const nickname = user?.nickname || '';
  const updatePause = useUpdateRoutinePauseMutation(nickname);
  const updateVisibility = useUpdateRoutineVisibilityMutation();
  const deleteRoutine = useDeleteRoutineMutation(nickname);
  const routineStatusIconColor = palette.theme.softBlue[80];
  const filteredRoutines = useMemo(
    () =>
      routines.filter((routine) => {
        if (!showsPausedRoutines && routine.paused) {
          return false;
        }

        if (!showsHiddenRoutines && routine.hidden) {
          return false;
        }

        return getRoutineStatus(routine) === selectedStatus;
      }),
    [routines, selectedStatus, showsHiddenRoutines, showsPausedRoutines],
  );
  const openMenuRoutineIndex = filteredRoutines.findIndex(
    (routine) => routine.routineId === openMenuRoutineId,
  );
  const openMenuRoutine =
    openMenuRoutineIndex >= 0 ? filteredRoutines[openMenuRoutineIndex] : null;
  const closeRoutineMenu = () => {
    setOpenMenuRoutineId(null);
  };
  const handleToggleRoutineMenu = (routineId: Routine['routineId']) => {
    setOpenMenuRoutineId((currentRoutineId) =>
      currentRoutineId === routineId ? null : routineId,
    );
  };
  const handleShowUpdateModal = (routine: Routine) => {
    closeRoutineMenu();
    router.push('/modal?type=routine-update');
    setRoutineId(routine.routineId);
    setRoutineForm(routine);
  };
  const handleToggleRoutineVisibility = (routine: Routine) => {
    closeRoutineMenu();
    updateVisibility.mutate(
      { routineId: routine.routineId, hidden: !routine.hidden },
      {
        onSuccess: ({ message }) => {
          showToast(message, 'success');
        },
        onError: (error) => {
          showToast(
            getApiErrorMessage(error, '루틴 표시 상태를 변경하지 못했습니다.'),
            'error',
          );
        },
      },
    );
  };
  const handleToggleRoutinePause = (routine: Routine) => {
    closeRoutineMenu();
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
  };
  const handleDeleteRoutine = (routine: Routine) => {
    closeRoutineMenu();
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
            },
            onError: () => {
              showToast('문제가 발생하였습니다.', 'error');
            },
          });
        },
      },
    ]);
  };
  const renderRoutineItem = ({ item }: { item: Routine }) => (
    <View
      testID={`routine-settings-routine-row-${item.routineId}`}
      style={styles.routineRow}
    >
      <Typography
        color={palette.theme.gray[90]}
        numberOfLines={1}
        style={styles.routineName}
        variant="body2"
      >
        {item.routineName}
      </Typography>
      <View
        style={styles.routineStatusIcons}
        testID={`routine-settings-routine-status-icons-${item.routineId}`}
      >
        {item.hidden ? (
          <RoutineHiddenIcon
            color={routineStatusIconColor}
            routineId={item.routineId}
          />
        ) : null}
        {item.paused ? (
          <RoutinePausedIcon
            color={routineStatusIconColor}
            routineId={item.routineId}
          />
        ) : null}
      </View>
      <Pressable
        accessibilityLabel={`${item.routineName} 메뉴 열기`}
        accessibilityRole="button"
        onPress={() => {
          handleToggleRoutineMenu(item.routineId);
        }}
        style={styles.moreIndicator}
        testID={`routine-settings-routine-menu-trigger-${item.routineId}`}
      >
        <RoutineListMoreIcon
          color={routineMoreIconColor}
          routineId={item.routineId}
        />
      </Pressable>
    </View>
  );

  return (
    <Container noPadding style={styles.container}>
      <PageHeader title="전체 루틴 목록" showBackButton />
      <View testID="routine-settings-content" style={styles.content}>
        <View style={styles.filterArea} testID="routine-settings-filter-area">
          <View
            style={styles.statusFilters}
            testID="routine-settings-status-filters"
          >
            {STATUS_FILTERS.map((filter) => {
              const isSelected = selectedStatus === filter.key;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={filter.key}
                  onPress={() => {
                    setSelectedStatus(filter.key);
                  }}
                  style={[
                    styles.statusFilter,
                    isSelected && styles.statusFilterSelected,
                  ]}
                  testID={filter.testID}
                >
                  <Typography
                    color={
                      isSelected ? palette.white : palette.theme.softBlue[50]
                    }
                    variant="body3"
                    weight="semibold"
                  >
                    {filter.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
          <View
            style={styles.optionFilters}
            testID="routine-settings-option-filters"
          >
            <View
              style={styles.optionCheckbox}
              testID="routine-settings-paused-checkbox"
            >
              <Checkbox
                size="md"
                disableText
                isChecked={showsPausedRoutines}
                fillColor={palette.white}
                onPress={setShowsPausedRoutines}
              />
              <Typography
                color={checkboxLabelColor}
                testID="routine-settings-paused-checkbox-label"
                variant="body3"
              >
                일시정지
              </Typography>
            </View>
            <View
              style={styles.optionCheckbox}
              testID="routine-settings-hidden-checkbox"
            >
              <Checkbox
                size="md"
                disableText
                isChecked={showsHiddenRoutines}
                fillColor={palette.white}
                onPress={setShowsHiddenRoutines}
              />
              <Typography
                color={checkboxLabelColor}
                testID="routine-settings-hidden-checkbox-label"
                variant="body3"
              >
                숨김
              </Typography>
            </View>
          </View>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Loading />
          </View>
        ) : (
          <View style={styles.routineListWrapper}>
            {openMenuRoutineId ? (
              <Pressable
                accessibilityLabel="루틴 컨텍스트 메뉴 닫기"
                accessibilityRole="button"
                onPress={closeRoutineMenu}
                style={styles.contextMenuBackdrop}
                testID="routine-context-menu-backdrop"
              />
            ) : null}
            <FlashList
              data={filteredRoutines}
              keyExtractor={(item) => `${item.routineId}`}
              renderItem={renderRoutineItem}
              contentContainerStyle={styles.routineListContent}
              estimatedItemSize={ROUTINE_ROW_HEIGHT}
              extraData={openMenuRoutineId}
              getItemLayout={getRoutineItemLayout}
              ListEmptyComponent={
                <EmptyState
                  icon="list-outline"
                  message="표시할 루틴이 없습니다."
                  messageColor={palette.theme.gray[60]}
                  transparent
                />
              }
              maxToRenderPerBatch={10}
              removeClippedSubviews
              showsVerticalScrollIndicator={false}
              testID="routine-settings-routine-list"
              windowSize={7}
            />
            {openMenuRoutine ? (
              <RoutineContextMenuPanel
                routineId={openMenuRoutine.routineId}
                isHidden={openMenuRoutine.hidden}
                isPaused={openMenuRoutine.paused}
                onEdit={() => handleShowUpdateModal(openMenuRoutine)}
                onHide={() => handleToggleRoutineVisibility(openMenuRoutine)}
                onPause={() => handleToggleRoutinePause(openMenuRoutine)}
                onRequest={closeRoutineMenu}
                onDelete={() => handleDeleteRoutine(openMenuRoutine)}
                showsRequestItem={false}
                style={[
                  styles.contextMenuPanel,
                  { top: openMenuRoutineIndex * ROUTINE_ROW_HEIGHT },
                ]}
              />
            ) : null}
          </View>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.brand.secondary,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.brand.secondary,
  },
  filterArea: {
    paddingTop: theme.foundation.spacing[3],
    paddingHorizontal: theme.foundation.spacing[5],
  },
  statusFilters: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[1],
  },
  statusFilter: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    paddingHorizontal: theme.foundation.spacing[3],
    borderRadius: theme.foundation.radii.xl,
    borderWidth: 1,
    borderColor: palette.theme.softBlue[50],
  },
  statusFilterSelected: {
    borderColor: palette.theme.gray[90],
    backgroundColor: palette.theme.gray[90],
  },
  optionFilters: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.foundation.spacing[3],
    marginTop: theme.foundation.spacing[2.5],
    marginBottom: theme.foundation.spacing[1.5],
    paddingRight: theme.foundation.spacing[1],
  },
  optionCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[1.5],
  },
  loadingContainer: {
    flex: 1,
  },
  routineListWrapper: {
    flex: 1,
    overflow: 'visible',
  },
  routineListContent: {
    paddingTop: baseFoundation.spacing[0],
    paddingHorizontal: theme.foundation.spacing[6],
    paddingBottom: baseFoundation.dimension.x96,
  },
  routineRow: {
    minHeight: ROUTINE_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.foundation.spacing[2.5],
    position: 'relative',
    overflow: 'visible',
  },
  routineName: {
    flex: 1,
  },
  moreIndicator: {
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: baseFoundation.spacing[1],
    opacity: 0.55,
  },
  routineStatusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[2],
  },
  contextMenuBackdrop: {
    position: 'absolute',
    top: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    bottom: baseFoundation.spacing[0],
    left: baseFoundation.spacing[0],
    zIndex: baseFoundation.zIndex.popover - 1,
  },
  contextMenuPanel: {
    right: baseFoundation.spacing[10],
  },
}));
