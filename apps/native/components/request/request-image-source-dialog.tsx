import { useCallback, useEffect, useRef } from 'react';
import { Platform, Pressable, View } from 'react-native';

import RequestDialogCloseIcon from '@/components/icons/request-image/request-dialog-close-icon';
import RequestImageSourceTile, {
  type RequestImageSourceKind,
} from '@/components/request/request-image-source-tile';
import FullscreenModal from '@/components/ui/fullscreen-modal';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

// iOS는 네이티브 Modal이 완전히 닫힌 뒤(onDismiss) 사진 선택기를 띄워야 한다.
// 닫히는 도중에 선택기를 띄우면 Modal과 함께 사라진다.
// onDismiss가 오지 않는 환경을 위한 안전장치. fade 해제(약 0.3~0.5초)보다 충분히 늦게 잡아 onDismiss를 앞지르지 않게 한다.
const DISMISS_FALLBACK_MS = 1200;

interface RequestImageSourceDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (source: RequestImageSourceKind) => void;
}

const RequestImageSourceDialog = ({
  visible,
  onClose,
  onSelect,
}: RequestImageSourceDialogProps) => {
  const pendingSourceRef = useRef<RequestImageSourceKind | null>(null);
  // onSelect는 부모 렌더마다 새로 만들어지므로 ref로 최신값을 들고, flush는 안정된 참조를 유지한다.
  const onSelectRef = useRef(onSelect);

  onSelectRef.current = onSelect;

  const flushPendingSource = useCallback(() => {
    const source = pendingSourceRef.current;

    if (!source) return;

    pendingSourceRef.current = null;
    onSelectRef.current(source);
  }, []);

  const handleSelect = (source: RequestImageSourceKind) => {
    pendingSourceRef.current = source;
    onClose();

    if (Platform.OS !== 'ios') {
      flushPendingSource();
    }
  };

  useEffect(() => {
    if (visible || !pendingSourceRef.current) return;

    const timer = setTimeout(flushPendingSource, DISMISS_FALLBACK_MS);

    return () => clearTimeout(timer);
  }, [flushPendingSource, visible]);

  return (
    <FullscreenModal
      animationType="fade"
      onDismiss={flushPendingSource}
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.root} testID="request-image-source-dialog">
        <Pressable
          accessibilityLabel="사진 추가 닫기"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
          testID="request-image-source-backdrop"
        />
        <View accessibilityViewIsModal style={styles.card}>
          <View style={styles.header}>
            <Typography variant="subtitle2" weight="bold" style={styles.title}>
              사진 추가
            </Typography>
            <Pressable
              accessibilityLabel="닫기"
              accessibilityRole="button"
              hitSlop={baseFoundation.spacing[2]}
              onPress={onClose}
              testID="request-image-source-close"
            >
              <RequestDialogCloseIcon />
            </Pressable>
          </View>
          <View style={styles.body}>
            <View style={styles.tileRow}>
              <RequestImageSourceTile
                kind="gallery"
                onPress={() => handleSelect('gallery')}
                testID="gallery-button"
              />
              <RequestImageSourceTile
                kind="camera"
                onPress={() => handleSelect('camera')}
                testID="camera-button"
              />
            </View>
          </View>
        </View>
      </View>
    </FullscreenModal>
  );
};

export default RequestImageSourceDialog;

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: baseFoundation.spacing[7],
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: requestFormColors.overlay,
  },
  card: {
    borderRadius: baseFoundation.radii.s,
    backgroundColor: requestFormColors.dialogSurface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: baseFoundation.spacing[5],
    paddingHorizontal: baseFoundation.spacing[5],
  },
  title: {
    flex: 1,
    color: requestFormColors.dialogTitle,
    lineHeight: 24.48,
    letterSpacing: -0.36,
  },
  body: {
    paddingHorizontal: baseFoundation.spacing[5],
    paddingVertical: baseFoundation.spacing[7],
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[3],
  },
}));
