import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import RequestCameraIcon from '@/components/icons/request-image/request-camera-icon';
import RequestPhotoIcon from '@/components/icons/request-image/request-photo-icon';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

export type RequestImageSourceKind = 'camera' | 'gallery';

const SOURCE_TILE_CONTENT: Record<
  RequestImageSourceKind,
  { Icon: typeof RequestPhotoIcon; label: string; accessibilityHint: string }
> = {
  gallery: {
    Icon: RequestPhotoIcon,
    label: '앨범 선택',
    accessibilityHint: '앨범에서 인증 사진을 선택합니다',
  },
  camera: {
    Icon: RequestCameraIcon,
    label: '카메라 촬영',
    accessibilityHint: '카메라로 인증 사진을 촬영합니다',
  },
};

interface RequestImageSourceTileProps {
  kind: RequestImageSourceKind;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const RequestImageSourceTile = ({
  kind,
  onPress,
  disabled = false,
  style,
  testID,
}: RequestImageSourceTileProps) => {
  const { Icon, label, accessibilityHint } = SOURCE_TILE_CONTENT[kind];

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.tile, disabled && styles.tileDisabled, style]}
      testID={testID}
    >
      <Icon />
      <Typography variant="body2" style={styles.label}>
        {label}
      </Typography>
    </Pressable>
  );
};

export default RequestImageSourceTile;

const styles = StyleSheet.create(() => ({
  tile: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.spacing[1],
    paddingHorizontal: baseFoundation.spacing[3],
    borderRadius: baseFoundation.radii.s,
    backgroundColor: requestFormColors.surface,
  },
  tileDisabled: { opacity: baseFoundation.opacity.disabled },
  label: {
    color: requestFormColors.text,
    textAlign: 'center',
    lineHeight: 20.4,
    letterSpacing: -0.3,
  },
}));
