import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { useRouter } from 'expo-router';
import { Alert, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useRoutineDelete } from '@/hooks/useRoutineDelete';
import { useRoutineId, useSetRoutineForm } from '@/hooks/useRoutineSelection';

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

  return (
    <ThemeView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemeView style={{ marginBottom: -20 }} transparent>
          <Typography variant="subtitle" style={styles.infoLabel}>
            {detail?.routineName}
          </Typography>
        </ThemeView>
        <ThemeView style={styles.content} transparent>
          <Typography>{detail?.routineDetail}</Typography>
        </ThemeView>

        <ThemeView style={styles.content} transparent>
          <Typography variant="subtitle" style={styles.infoLabel}>
            메이트
          </Typography>
          <Typography>{detail?.isMe ? '나' : detail?.mateNickname}</Typography>
        </ThemeView>

        <ThemeView style={styles.content} transparent>
          <Typography variant="subtitle" style={styles.infoLabel}>
            루틴 횟수
          </Typography>
          <Typography>
            {detail?.weeklyCount || 0}/{detail?.routineCount}
          </Typography>
        </ThemeView>

        <ThemeView style={styles.content} transparent>
          <Typography variant="subtitle" style={styles.infoLabel}>
            벌금
          </Typography>
          <Typography>{detail?.penalty.toLocaleString()}</Typography>
        </ThemeView>

        <ThemeView style={styles.content} transparent>
          <Typography variant="subtitle" style={styles.infoLabel}>
            루틴 날짜
          </Typography>
          <Typography>
            {detail?.startDate} ~ {detail?.endDate}
          </Typography>
          <Divider spacing={20} />
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
        </ThemeView>
      </ScrollView>
    </ThemeView>
  );
};

export default RoutineDetailModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 10,
  },

  scroll: {
    gap: 20,
    paddingBottom: 50,
  },

  infoLabel: {
    fontWeight: 'bold',
    marginBottom: 10,
  },

  content: {
    marginBottom: 10,
  },

  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  button: {
    flex: 1,
  },
});
