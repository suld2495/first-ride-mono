import { Image, type ImageSourcePropType, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { UpdateNotice } from '@/api/update-notices.api';
import { Button } from '@/components/ui/button';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import FullscreenModal from '@/components/ui/fullscreen-modal';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useWhatsNewModal } from '@/hooks/useWhatsNewModal';
import { baseFoundation, palette } from '@/theme/tokens';

const UPDATE_NUMBER_WIDTH = baseFoundation.dimension.x48;
const MINIMUM_FOOTER_BOTTOM_PADDING = baseFoundation.spacing[3];
const CHARACTER_IMAGE =
  require('../../assets/routine/character.png') as ImageSourcePropType;

const renderUpdateItem: ListRenderItem<UpdateNotice> = ({ item, index }) => (
  <View style={styles.updateItem} testID={`whats-new-item-${index + 1}`}>
    <Typography variant="h3" weight="medium" style={styles.updateNumber}>
      {(index + 1).toString().padStart(2, '0')}
    </Typography>
    <View style={styles.updateCopy}>
      <Typography variant="body1" weight="bold" style={styles.updateTitle}>
        {item.title}
      </Typography>
      <Typography
        variant="caption1"
        weight="regular"
        style={styles.updateDescription}
      >
        {item.description}
      </Typography>
    </View>
  </View>
);

interface WhatsNewModalContentProps {
  onDismiss: () => void;
  updates: readonly UpdateNotice[];
}

const WhatsNewModalContent = ({
  onDismiss,
  updates,
}: WhatsNewModalContentProps) => {
  const insets = useSafeAreaInsets();

  return (
    <FullscreenModal
      visible
      animationType="fade"
      transparent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay} testID="whats-new-overlay">
        <View
          accessibilityViewIsModal
          style={styles.sheet}
          testID="whats-new-sheet"
        >
          <View style={styles.hero}>
            <View
              style={styles.characterSlot}
              testID="whats-new-character-slot"
            >
              <Image
                accessibilityLabel="이루라 캐릭터"
                resizeMode="contain"
                source={CHARACTER_IMAGE}
                style={styles.character}
                testID="whats-new-character"
              />
            </View>
            <Typography variant="caption1" weight="bold" style={styles.eyebrow}>
              WHAT&apos;S NEW
            </Typography>
            <Typography
              variant="h2"
              weight="bold"
              textAlign="center"
              style={styles.title}
            >
              새로워진 이루라
            </Typography>
            <Typography
              variant="body3"
              weight="medium"
              textAlign="center"
              style={styles.introduction}
            >
              여러분이 보내주신 피드백을 반영해{'\n'}
              이루라가 더 편리해졌어요!
            </Typography>
          </View>

          {/* 업데이트 설명은 화면 너비와 글꼴 설정에 따라 높이가 달라져 getItemLayout을 사용할 수 없다. */}
          {/* eslint-disable-next-line local-rules/no-flatlist-missing-get-item-layout */}
          <FlashList
            contentContainerStyle={styles.listContent}
            data={updates}
            keyExtractor={(item) => item.id.toString()}
            maxToRenderPerBatch={6}
            removeClippedSubviews
            renderItem={renderUpdateItem}
            style={styles.list}
            testID="whats-new-list"
            windowSize={3}
          />

          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(
                  insets.bottom,
                  MINIMUM_FOOTER_BOTTOM_PADDING,
                ),
              },
            ]}
            testID="whats-new-footer"
          >
            <Button
              accessibilityLabel="이루라 시작하기"
              backgroundColor={palette.theme.blue[50]}
              fullWidth
              onPress={onDismiss}
              size="lg"
              textColor={palette.white}
            >
              이루라 시작하기
            </Button>
          </View>
        </View>
      </View>
    </FullscreenModal>
  );
};

interface WhatsNewModalProps {
  buildNumber: number | null;
  updates: readonly UpdateNotice[];
}

const WhatsNewModal = ({ buildNumber, updates }: WhatsNewModalProps) => {
  const { dismiss, isVisible } = useWhatsNewModal(buildNumber);

  if (!isVisible || updates.length === 0) {
    return null;
  }

  return <WhatsNewModalContent onDismiss={dismiss} updates={updates} />;
};

export default WhatsNewModal;

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 26, 49, 0.72)',
  },
  sheet: {
    width: '100%',
    height: '80%',
    minHeight: 0,
    overflow: 'hidden',
    borderTopLeftRadius: baseFoundation.dimension.x28,
    borderTopRightRadius: baseFoundation.dimension.x28,
    backgroundColor: palette.white,
    shadowColor: palette.theme.blue[100],
    shadowOffset: {
      width: baseFoundation.dimension.x0,
      height: -baseFoundation.dimension.x4,
    },
    shadowOpacity: 0.2,
    shadowRadius: baseFoundation.dimension.x16,
    elevation: 12,
  },
  hero: {
    alignItems: 'center',
    paddingTop: theme.foundation.spacing[4],
    paddingHorizontal: theme.foundation.spacing[5],
    paddingBottom: theme.foundation.spacing[5],
    backgroundColor: palette.theme.blue[5],
  },
  characterSlot: {
    width: baseFoundation.dimension.x80,
    height: baseFoundation.dimension.x84,
    marginBottom: theme.foundation.spacing[3],
    zIndex: 1,
  },
  character: {
    width: '100%',
    height: '100%',
  },
  eyebrow: {
    marginBottom: theme.foundation.spacing[1],
    color: palette.theme.blue[50],
    letterSpacing: 0.4,
  },
  title: {
    color: palette.theme.blue[100],
  },
  introduction: {
    marginTop: theme.foundation.spacing[2],
    color: palette.theme.blue[80],
    lineHeight: baseFoundation.dimension.x22,
  },
  list: {
    flex: 1,
    minHeight: 0,
    backgroundColor: palette.white,
  },
  listContent: {
    paddingHorizontal: theme.foundation.spacing[5],
  },
  updateItem: {
    flexDirection: 'row',
    paddingVertical: theme.foundation.spacing[4],
    borderBottomWidth: baseFoundation.dimension.x1,
    borderBottomColor: palette.theme.gray[200],
  },
  updateNumber: {
    width: UPDATE_NUMBER_WIDTH,
    color: palette.theme.blue[20],
    lineHeight: baseFoundation.dimension.x32,
  },
  updateCopy: {
    flex: 1,
    gap: theme.foundation.spacing[1],
  },
  updateTitle: {
    color: palette.theme.blue[100],
  },
  updateDescription: {
    color: palette.theme.gray[600],
    lineHeight: baseFoundation.dimension.x20,
  },
  footer: {
    paddingTop: theme.foundation.spacing[3],
    paddingHorizontal: theme.foundation.spacing[4],
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: palette.theme.gray[200],
    backgroundColor: palette.white,
  },
}));
