import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutineSummaryQuery } from '@repo/shared/hooks/useRoutine';
import { Pressable, ScrollView, View } from 'react-native';

import FullscreenModal from '@/components/ui/fullscreen-modal';
import EmptyState from '@/components/ui/empty-state';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { baseFoundation, palette } from '@/theme/tokens';

interface RoutineInfoModalProps {
  onClose: () => void;
  routineId: number | null;
}

const RoutineInfoModal = ({ onClose, routineId }: RoutineInfoModalProps) => {
  const {
    data: summary,
    isError,
    isLoading,
  } = useRoutineSummaryQuery(routineId ?? 0);

  if (routineId === null) {
    return null;
  }

  return (
    <FullscreenModal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="루틴 설명 닫기"
          onPress={onClose}
          style={styles.modalBackdrop}
        />
        <View accessibilityViewIsModal style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Typography
              color={palette.theme.gray[80]}
              variant="subtitle2"
              weight="bold"
            >
              루틴 설명
            </Typography>
            <Pressable
              accessibilityLabel="닫기"
              accessibilityRole="button"
              hitSlop={baseFoundation.spacing[2]}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons
                color={palette.theme.gray[70]}
                name="close-outline"
                size={baseFoundation.iconSize.l}
              />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          >
            {isLoading ? (
              <View style={styles.stateContainer}>
                <Loading size="small" />
              </View>
            ) : isError || !summary ? (
              <View style={styles.stateContainer}>
                <EmptyState
                  icon="alert-circle-outline"
                  message="공개된 활성 루틴을 조회할 수 없습니다."
                  transparent
                />
              </View>
            ) : (
              <>
                <View style={styles.content}>
                  <Typography
                    color={palette.theme.gray[50]}
                    variant="caption1"
                    weight="bold"
                    style={styles.infoLabel}
                  >
                    루틴 이름
                  </Typography>
                  <Typography
                    color={palette.theme.gray[80]}
                    variant="body1"
                    weight="regular"
                  >
                    {summary.routineName}
                  </Typography>
                </View>

                <View style={styles.content}>
                  <Typography
                    color={palette.theme.gray[50]}
                    variant="caption1"
                    weight="bold"
                    style={styles.infoLabel}
                  >
                    루틴 설명
                  </Typography>
                  <Typography
                    color={palette.theme.gray[80]}
                    variant="body1"
                    weight="regular"
                  >
                    {summary.routineDetail?.trim() || '-'}
                  </Typography>
                </View>

                <View style={styles.content}>
                  <Typography
                    color={palette.theme.gray[50]}
                    variant="caption1"
                    weight="bold"
                    style={styles.infoLabel}
                  >
                    루틴 수행 횟수
                  </Typography>
                  <View style={styles.countValueRow}>
                    <Typography
                      color={palette.theme.gray[80]}
                      variant="body1"
                      weight="regular"
                    >
                      {summary.totalSuccessCount}
                    </Typography>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </FullscreenModal>
  );
};

export default RoutineInfoModal;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: baseFoundation.spacing[6],
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 3, 6, 0.48)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    borderRadius: baseFoundation.dimension.x16,
    backgroundColor: palette.white,
    padding: baseFoundation.spacing[5],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: baseFoundation.spacing[4],
  },
  closeButton: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexShrink: 1,
    gap: baseFoundation.spacing[5],
    paddingBottom: baseFoundation.spacing[1],
  },
  stateContainer: {
    minHeight: 180,
  },
  infoLabel: {
    marginBottom: baseFoundation.spacing[1.5],
  },
  content: {
    marginBottom: baseFoundation.spacing[0],
  },
  countValueRow: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderLeftWidth: baseFoundation.dimension.x3,
    borderLeftColor: palette.theme.blue[50],
    paddingLeft: baseFoundation.spacing[3],
  },
});
