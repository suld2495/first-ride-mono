import type { Friend } from '@repo/types';
import { useCallback } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  View,
  type ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';

import {
  getRoutineSceneCharacterAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { EmptyState } from '@/components/ui/empty-state';
import { FlashList } from '@/components/ui/flash-list';
import { Loading } from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

interface FriendItemProps {
  friend: Friend;
  itemWidth: number;
  imageSize: number;
  onOpen: (friend: Friend) => void;
}

interface FriendRenderItemProps {
  item: Friend;
}

const REMOTE_ASSET_HOST = (process.env.EXPO_PUBLIC_VITE_BASE_URL ?? '').replace(
  /\/$/,
  '',
);
const FRIEND_LAYOUT_BASE_SCREEN_WIDTH = 430;
const FRIEND_LAYOUT_BASE_ITEM_WIDTH = 183;
const FRIEND_LAYOUT_BASE_IMAGE_SIZE = 120;
const FRIEND_IMAGE_MIN_SIZE = 100;
const FRIEND_ITEM_TO_IMAGE_RATIO =
  FRIEND_LAYOUT_BASE_ITEM_WIDTH / FRIEND_LAYOUT_BASE_IMAGE_SIZE;

const getFriendItemLayoutSize = (screenWidth: number) => {
  const imageSize = Math.max(
    FRIEND_IMAGE_MIN_SIZE,
    Math.round(
      (screenWidth / FRIEND_LAYOUT_BASE_SCREEN_WIDTH) *
        FRIEND_LAYOUT_BASE_IMAGE_SIZE,
    ),
  );
  const itemWidth = Math.round(imageSize * FRIEND_ITEM_TO_IMAGE_RATIO);

  return { imageSize, itemWidth };
};

const getFriendCharacterSource = (
  characterImageUrl: Friend['characterImageUrl'],
): ImageSourcePropType | null => {
  if (!characterImageUrl) {
    return null;
  }

  if (/^(https?:|data:|file:)/.test(characterImageUrl)) {
    return { uri: characterImageUrl };
  }

  if (characterImageUrl.startsWith('/') && REMOTE_ASSET_HOST) {
    return { uri: `${REMOTE_ASSET_HOST}${characterImageUrl}` };
  }

  return { uri: characterImageUrl };
};

const FriendItem = ({
  friend,
  itemWidth,
  imageSize,
  onOpen,
}: FriendItemProps) => {
  const { nickname, mateNickname, job, level, characterImageUrl } = friend;
  const subtitle = mateNickname?.trim() || job;
  const characterSource = getFriendCharacterSource(characterImageUrl);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: itemWidth },
        pressed ? styles.cardPressed : null,
      ]}
      onPress={() => onOpen(friend)}
      accessibilityRole="button"
      accessibilityLabel={`${nickname} 루틴 보기`}
    >
      <ThemeView
        style={[styles.characterPanel, { width: itemWidth, height: itemWidth }]}
        transparent
      >
        {characterSource ? (
          <Image
            source={characterSource}
            style={{ width: imageSize, height: imageSize }}
            resizeMode="contain"
            accessibilityLabel={`${nickname} 캐릭터`}
          />
        ) : (
          renderRoutineSceneAsset(getRoutineSceneCharacterAsset('blue'), {
            testID: `friend-character-fallback-${friend.userId}`,
            style: { width: imageSize, height: imageSize },
          })
        )}
        <View style={styles.levelBadge}>
          <Typography variant="caption2" weight="semibold" style={styles.level}>
            Lv. {level}
          </Typography>
        </View>
      </ThemeView>

      <Typography
        variant="body2"
        weight="semibold"
        style={styles.nickname}
        numberOfLines={1}
      >
        {nickname}
      </Typography>
      <Typography variant="body3" style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </Typography>
    </Pressable>
  );
};

interface FriendListProps {
  friends?: Friend[];
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onOpenFriend: (friend: Friend) => void;
}

const FriendList = ({
  friends,
  isLoading,
  refreshing,
  onRefresh,
  onOpenFriend,
}: FriendListProps) => {
  const isTestEnv = process.env.NODE_ENV === 'test';
  const { width: screenWidth } = useWindowDimensions();
  const { itemWidth, imageSize } = getFriendItemLayoutSize(screenWidth);

  const renderFriendItem = useCallback(
    ({ item }: FriendRenderItemProps) => (
      <FriendItem
        friend={item}
        itemWidth={itemWidth}
        imageSize={imageSize}
        onOpen={onOpenFriend}
      />
    ),
    [imageSize, itemWidth, onOpenFriend],
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!friends || friends.length === 0) {
    return <EmptyState icon="people-outline" message="친구를 추가해보세요." />;
  }

  const ListComponent = isTestEnv ? FlatList<Friend> : FlashList<Friend>;

  return (
    <ListComponent
      data={friends}
      keyExtractor={(item) => item.nickname}
      renderItem={renderFriendItem}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      style={styles.list}
      refreshing={refreshing}
      onRefresh={onRefresh}
      estimatedItemSize={baseFoundation.dimension.x180}
      removeClippedSubviews
      maxToRenderPerBatch={8}
      windowSize={5}
      numColumns={2}
    />
  );
};

export default FriendList;

const styles = StyleSheet.create((theme) => ({
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[8],
  },
  row: {
    justifyContent: 'center',
    gap: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[5],
  },
  card: {
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.82,
  },
  characterPanel: {
    borderRadius: baseFoundation.dimension.x10,
    backgroundColor: theme.colors.brand.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  levelBadge: {
    position: 'absolute',
    top: theme.foundation.spacing[2],
    right: theme.foundation.spacing[2],
    minWidth: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x20,
    paddingHorizontal: theme.foundation.spacing[1.5],
    borderRadius: baseFoundation.dimension.x10,
    backgroundColor: theme.colors.brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  level: {
    color: theme.colors.action.primary.default,
  },
  nickname: {
    width: '100%',
    marginTop: theme.foundation.spacing[2],
    color: theme.colors.brand.text,
    textAlign: 'center',
  },
  subtitle: {
    width: '100%',
    marginTop: baseFoundation.dimension.x10,
    color: theme.colors.text.soft,
    textAlign: 'center',
  },
}));
