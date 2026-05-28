import type { Friend } from '@repo/types';
import { useCallback } from 'react';
import {
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
import { appThemes, type ThemeName } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';

interface FriendItemProps {
  friend: Friend;
  itemWidth: number;
  imageSize: number;
  isRightColumn: boolean;
  onOpen: (friend: Friend) => void;
}

interface FriendRenderItemProps {
  index: number;
  item: Friend;
}

type FriendCharacterThemeName = Extract<ThemeName, 'blue' | 'green' | 'red'>;

const REMOTE_ASSET_HOST = (process.env.EXPO_PUBLIC_VITE_BASE_URL ?? '').replace(
  /\/$/,
  '',
);
const FRIEND_LAYOUT_BASE_ITEM_WIDTH = 183;
const FRIEND_LAYOUT_BASE_IMAGE_SIZE = 120;
const FRIEND_IMAGE_MIN_SIZE = 100;
const FRIEND_LIST_HORIZONTAL_PADDING = baseFoundation.spacing[5];
const FRIEND_GRID_COLUMN_GAP = baseFoundation.spacing[4];
const FRIEND_GRID_COLUMN_COUNT = 2;
const FRIEND_ITEM_TO_IMAGE_RATIO =
  FRIEND_LAYOUT_BASE_ITEM_WIDTH / FRIEND_LAYOUT_BASE_IMAGE_SIZE;
const FRIEND_ITEM_TEXT_BLOCK_HEIGHT =
  baseFoundation.spacing[2] +
  baseFoundation.dimension.x10 +
  baseFoundation.typography.size.body2 +
  baseFoundation.typography.size.body3 +
  baseFoundation.spacing[5];

const getFriendItemLayoutSize = (screenWidth: number) => {
  const itemWidth = Math.round(
    (screenWidth -
      FRIEND_LIST_HORIZONTAL_PADDING * 2 -
      FRIEND_GRID_COLUMN_GAP) /
      FRIEND_GRID_COLUMN_COUNT,
  );
  const imageSize = Math.max(
    FRIEND_IMAGE_MIN_SIZE,
    Math.round(itemWidth / FRIEND_ITEM_TO_IMAGE_RATIO),
  );

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

const getFriendCharacterThemeName = ({
  characterCode,
  job,
}: Pick<Friend, 'characterCode' | 'job'>): FriendCharacterThemeName => {
  const normalizedCharacter = `${characterCode} ${job}`.toUpperCase();

  if (
    normalizedCharacter.includes('MAGE') ||
    normalizedCharacter.includes('마법사')
  ) {
    return 'red';
  }

  if (
    normalizedCharacter.includes('ARCHER') ||
    normalizedCharacter.includes('궁수')
  ) {
    return 'green';
  }

  return 'blue';
};

const getFriendCharacterPanelStyle = (themeName: FriendCharacterThemeName) => {
  if (themeName === 'red') return styles.characterPanelRed;
  if (themeName === 'green') return styles.characterPanelGreen;

  return styles.characterPanelBlue;
};

const getFriendLevelBadgeStyle = (themeName: FriendCharacterThemeName) => {
  if (themeName === 'red') return styles.levelBadgeRed;
  if (themeName === 'green') return styles.levelBadgeGreen;

  return styles.levelBadgeBlue;
};

const getFriendLevelTextColor = (themeName: FriendCharacterThemeName) => {
  if (themeName === 'red') return appThemes.red.colors.brand.text;
  if (themeName === 'green') return appThemes.green.colors.brand.text;

  return appThemes.blue.colors.brand.text;
};

const FriendItem = ({
  friend,
  itemWidth,
  imageSize,
  isRightColumn,
  onOpen,
}: FriendItemProps) => {
  const {
    nickname,
    motto,
    mateNickname,
    job,
    level,
    characterCode,
    characterImageUrl,
  } = friend;
  const subtitle = motto?.trim() || mateNickname?.trim() || job;
  const characterSource = getFriendCharacterSource(characterImageUrl);
  const characterThemeName = getFriendCharacterThemeName({
    characterCode,
    job,
  });
  const testIdSuffix = nickname;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isRightColumn ? styles.rightColumnCard : null,
        { width: itemWidth },
        pressed ? styles.cardPressed : null,
      ]}
      onPress={() => onOpen(friend)}
      accessibilityRole="button"
      accessibilityLabel={`${nickname} 루틴 보기`}
    >
      <ThemeView
        testID={`friend-character-panel-${testIdSuffix}`}
        style={[
          styles.characterPanel,
          getFriendCharacterPanelStyle(characterThemeName),
          { width: itemWidth, height: itemWidth },
        ]}
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
          renderRoutineSceneAsset(
            getRoutineSceneCharacterAsset(characterThemeName),
            {
              testID: `friend-character-fallback-${testIdSuffix}`,
              style: { width: imageSize, height: imageSize },
            },
          )
        )}
        <View
          testID={`friend-level-badge-${testIdSuffix}`}
          style={[
            styles.levelBadge,
            getFriendLevelBadgeStyle(characterThemeName),
          ]}
        >
          <Typography
            testID={`friend-level-text-${testIdSuffix}`}
            variant="caption2"
            weight="semibold"
            color={getFriendLevelTextColor(characterThemeName)}
            style={styles.level}
          >
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
  const { width: screenWidth } = useWindowDimensions();
  const { itemWidth, imageSize } = getFriendItemLayoutSize(screenWidth);
  const itemHeight = itemWidth + FRIEND_ITEM_TEXT_BLOCK_HEIGHT;

  const renderFriendItem = useCallback(
    ({ index, item }: FriendRenderItemProps) => (
      <FriendItem
        friend={item}
        itemWidth={itemWidth}
        imageSize={imageSize}
        isRightColumn={index % 2 === 1}
        onOpen={onOpenFriend}
      />
    ),
    [imageSize, itemWidth, onOpenFriend],
  );
  const getFriendItemLayout = useCallback(
    (_: Friend[] | null, index: number) => ({
      length: itemHeight,
      offset: itemHeight * Math.floor(index / FRIEND_GRID_COLUMN_COUNT),
      index,
    }),
    [itemHeight],
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!friends || friends.length === 0) {
    return <EmptyState icon="people-outline" message="친구를 추가해보세요." />;
  }

  return (
    <FlashList
      data={friends}
      keyExtractor={(item) => item.nickname}
      renderItem={renderFriendItem}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      style={styles.list}
      refreshing={refreshing}
      onRefresh={onRefresh}
      getItemLayout={getFriendItemLayout}
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
    justifyContent: 'space-between',
  },
  card: {
    alignItems: 'center',
    marginBottom: theme.foundation.spacing[5],
  },
  rightColumnCard: {
    marginLeft: 'auto',
  },
  cardPressed: {
    opacity: 0.82,
  },
  characterPanel: {
    borderRadius: baseFoundation.dimension.x10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  characterPanelBlue: {
    backgroundColor: appThemes.blue.colors.brand.card,
  },
  characterPanelGreen: {
    backgroundColor: appThemes.green.colors.brand.card,
  },
  characterPanelRed: {
    backgroundColor: appThemes.red.colors.brand.card,
  },
  levelBadge: {
    position: 'absolute',
    top: theme.foundation.spacing[2],
    right: theme.foundation.spacing[2],
    minWidth: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x20,
    paddingHorizontal: theme.foundation.spacing[1.5],
    borderRadius: baseFoundation.dimension.x10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeBlue: {
    backgroundColor: appThemes.blue.colors.brand.background,
  },
  levelBadgeGreen: {
    backgroundColor: appThemes.green.colors.brand.background,
  },
  levelBadgeRed: {
    backgroundColor: appThemes.red.colors.brand.background,
  },
  level: {},
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
