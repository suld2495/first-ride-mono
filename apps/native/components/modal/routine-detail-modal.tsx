import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { useRouter } from 'expo-router';
import { Alert, ScrollView } from 'react-native';

import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useRoutineDelete } from '@/hooks/useRoutineDelete';
import { useRoutineManagement } from '@/hooks/useRoutineManagement';
import { useRoutineId, useSetRoutineForm } from '@/hooks/useRoutineSelection';
import { baseFoundation } from '@/theme/tokens';

const RoutineDetailModal = () => {
  const router = useRouter();
  const routineId = useRoutineId();
  const setRoutineForm = useSetRoutineForm();
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);

  const user = useAuthUser();
  const { deleteRoutineById } = useRoutineDelete(
    routineId,
    user?.nickname || '',
  );
  const {
    updateRoutinePause,
    updateRoutineVisibility,
    isUpdatingPause,
    isUpdatingVisibility,
  } = useRoutineManagement(routineId, user?.nickname || '');

  if (isLoading) {
    return null;
  }

  const handleDeleteRoutine = () => {
    Alert.alert('루틴 삭제', '삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: deleteRoutineById,
      },
    ]);
  };

  const handleMoveUpdate = () => {
    router.push('/modal?type=routine-update');

    if (detail) {
      setRoutineForm(detail);
    }
  };

  const handleTogglePause = () => {
    if (!detail) {
      return;
    }

    updateRoutinePause(!detail.paused);
  };

  const handleToggleVisibility = () => {
    if (!detail) {
      return;
    }

    updateRoutineVisibility(!detail.hidden);
  };

  return (
    <ThemeView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <ThemeView
          style={{ marginBottom: -baseFoundation.spacing[5] }}
          transparent
        >
          <ThemeView style={styles.titleRow} transparent>
            <Typography
              variant="subtitle"
              weight="semibold"
              style={styles.title}
            >
              {detail?.routineName}
            </Typography>
            {detail?.hidden && (
              <Ionicons
                name="eye-off-outline"
                size={baseFoundation.iconSize.s}
                color="#4C769C"
                accessibilityLabel="숨김 상태"
              />
            )}
          </ThemeView>
          {detail?.paused && (
            <ThemeView style={styles.statusRow} transparent>
              <Typography variant="caption" style={styles.statusText}>
                일시정지됨
              </Typography>
            </ThemeView>
          )}
        </ThemeView>
        <ThemeView style={styles.content} transparent>
          <Typography>{detail?.routineDetail}</Typography>
        </ThemeView>

        <ThemeView style={styles.content} transparent>
          <Typography
            variant="subtitle"
            weight="semibold"
            style={styles.infoLabel}
          >
            메이트
          </Typography>
          <Typography>{detail?.isMe ? '나' : detail?.mateNickname}</Typography>
        </ThemeView>

        <ThemeView style={styles.content} transparent>
          <Typography
            variant="subtitle"
            weight="semibold"
            style={styles.infoLabel}
          >
            루틴 횟수
          </Typography>
          <Typography>
            {detail?.weeklyCount || 0}/{detail?.routineCount}
          </Typography>
        </ThemeView>

        <ThemeView style={styles.content} transparent>
          <Typography
            variant="subtitle"
            weight="semibold"
            style={styles.infoLabel}
          >
            벌금
          </Typography>
          <Typography>{detail?.penalty.toLocaleString()}</Typography>
        </ThemeView>

        <ThemeView style={styles.content} transparent>
          <Typography
            variant="subtitle"
            weight="semibold"
            style={styles.infoLabel}
          >
            루틴 날짜
          </Typography>
          <Typography>
            {detail?.startDate} ~ {detail?.endDate}
          </Typography>
          <Divider spacing={baseFoundation.spacing[5]} />
        </ThemeView>

        <ThemeView style={styles.buttonContainer} transparent>
          <Button
            title="수정"
            variant="secondary"
            style={styles.button}
            onPress={handleMoveUpdate}
          />
          <Button
            title="삭제"
            variant="danger"
            style={styles.button}
            onPress={handleDeleteRoutine}
          />
          <Button
            title={detail?.paused ? '재시작' : '일시정지'}
            variant="secondary"
            style={styles.button}
            loading={isUpdatingPause}
            disabled={isUpdatingPause}
            onPress={handleTogglePause}
          />
          <Button
            title={detail?.hidden ? '표시' : '숨기기'}
            variant="secondary"
            style={styles.button}
            loading={isUpdatingVisibility}
            disabled={isUpdatingVisibility}
            onPress={handleToggleVisibility}
          />
        </ThemeView>
      </ScrollView>
    </ThemeView>
  );
};

export default RoutineDetailModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: baseFoundation.spacing[7],
    paddingHorizontal: baseFoundation.spacing[2.5],
  },

  scroll: {
    gap: baseFoundation.spacing[5],
    paddingBottom: baseFoundation.spacing[12],
  },

  infoLabel: {
    fontWeight: 'bold',
    marginBottom: baseFoundation.spacing[2.5],
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[1.5],
    marginBottom: baseFoundation.spacing[2.5],
  },

  title: {
    flexShrink: 1,
  },

  content: {
    marginBottom: baseFoundation.spacing[2.5],
  },

  buttonContainer: {
    marginTop: baseFoundation.spacing[2.5],
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: baseFoundation.spacing[2.5],
  },

  button: {
    flexBasis: '47%',
    flexGrow: 1,
  },

  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseFoundation.spacing[1.5],
  },

  statusText: {
    color: '#4C769C',
  },
});
