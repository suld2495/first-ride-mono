import type { Friend } from '@repo/types';
import { useCallback } from 'react';
import {
  Image,
  Pressable,
  View,
  type ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { FlashList } from '@/components/ui/flash-list';
import { Loading } from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import CharacterSpeechBubble from '@/feature/character/character-speech-bubble';
import { appThemes, type ThemeName } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';

interface FriendItemProps {
  friend: Friend;
  itemWidth: number;
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
const FRIEND_CHARACTER_HORIZONTAL_PADDING = 35;
const FRIEND_LIST_HORIZONTAL_PADDING = baseFoundation.spacing[5];
const FRIEND_GRID_COLUMN_GAP = baseFoundation.spacing[4];
const FRIEND_GRID_COLUMN_COUNT = 2;
const FRIEND_MOTTO_CHARACTER_OFFSET_Y = 17;
const FRIEND_MOTTO_BUBBLE_MIN_WIDTH = 80;
const FRIEND_MOTTO_BUBBLE_HORIZONTAL_MARGIN = baseFoundation.spacing[2];
const FRIEND_MOTTO_BUBBLE_VERTICAL_PADDING = 5;
const FRIEND_MOTTO_BUBBLE_TOP_MARGIN = baseFoundation.spacing[1.5];
const FRIEND_MOTTO_BUBBLE_CHARACTER_GAP = baseFoundation.dimension.x2;
const FRIEND_MOTTO_MAX_LINE_COUNT = 2;
const FRIEND_MOTTO_LINE_HEIGHT = 16;
const FRIEND_MOTTO_BUBBLE_SINGLE_LINE_TOP_MARGIN =
  FRIEND_MOTTO_BUBBLE_TOP_MARGIN + FRIEND_MOTTO_LINE_HEIGHT;
const FRIEND_MOTTO_BUBBLE_BORDER_WIDTH = 2;
const FRIEND_MOTTO_BUBBLE_TAIL_SPACE = baseFoundation.spacing[2];
const FRIEND_MOTTO_MAX_BUBBLE_HEIGHT =
  FRIEND_MOTTO_MAX_LINE_COUNT * FRIEND_MOTTO_LINE_HEIGHT +
  FRIEND_MOTTO_BUBBLE_VERTICAL_PADDING * 2 +
  FRIEND_MOTTO_BUBBLE_BORDER_WIDTH * 2 +
  FRIEND_MOTTO_BUBBLE_TAIL_SPACE;
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
  return { itemWidth };
};

const getFriendCharacterImageSize = (itemWidth: number) => {
  const widthBasedImageSize = Math.max(
    0,
    itemWidth - FRIEND_CHARACTER_HORIZONTAL_PADDING * 2,
  );
  const fixedTopSpace =
    FRIEND_MOTTO_BUBBLE_TOP_MARGIN +
    FRIEND_MOTTO_MAX_BUBBLE_HEIGHT +
    FRIEND_MOTTO_BUBBLE_CHARACTER_GAP;

  const heightBasedImageSize = Math.max(
    0,
    itemWidth - (fixedTopSpace - FRIEND_MOTTO_CHARACTER_OFFSET_Y) * 2,
  );

  return Math.min(widthBasedImageSize, heightBasedImageSize);
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
  isRightColumn,
  onOpen,
}: FriendItemProps) => {
  const { userId, nickname, job, level, characterCode, characterImageUrl } =
    friend;
  const subtitle = userId?.trim() ?? '';
  const motto = friend.motto?.trim() ?? '';
  const hasMotto = motto.length > 0;
  const characterImageSize = getFriendCharacterImageSize(itemWidth);
  const characterSource = getFriendCharacterSource(characterImageUrl);
  const characterThemeName = getFriendCharacterThemeName({
    characterCode,
    job,
  });
  const testIdSuffix = nickname;
  const characterStyle = [
    { width: characterImageSize, height: characterImageSize },
    hasMotto ? styles.characterWithMotto : null,
  ];

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
        {hasMotto && (
          <CharacterSpeechBubble
            containerMinHeight={null}
            containerMinWidth={FRIEND_MOTTO_BUBBLE_MIN_WIDTH}
            containerPaddingVertical={FRIEND_MOTTO_BUBBLE_VERTICAL_PADDING}
            maxWidth={itemWidth - FRIEND_MOTTO_BUBBLE_HORIZONTAL_MARGIN * 2}
            message={motto}
            numberOfLines={2}
            singleLineWrapperTop={FRIEND_MOTTO_BUBBLE_SINGLE_LINE_TOP_MARGIN}
            style={styles.speechBubble}
            testID={`friend-character-speech-bubble-${testIdSuffix}`}
            textVariant="caption2"
            themeName={characterThemeName}
            wrapperTop={FRIEND_MOTTO_BUBBLE_TOP_MARGIN}
          />
        )}
        {characterSource ? (
          <Image
            source={characterSource}
            style={characterStyle}
            resizeMode="contain"
            accessibilityLabel={`${nickname} 캐릭터`}
          />
        ) : null}
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
  const { itemWidth } = getFriendItemLayoutSize(screenWidth);
  const itemHeight = itemWidth + FRIEND_ITEM_TEXT_BLOCK_HEIGHT;

  const renderFriendItem = useCallback(
    ({ index, item }: FriendRenderItemProps) => (
      <FriendItem
        friend={item}
        itemWidth={itemWidth}
        isRightColumn={index % 2 === 1}
        onOpen={onOpenFriend}
      />
    ),
    [itemWidth, onOpenFriend],
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
    overflow: 'visible',
    position: 'relative',
  },
  characterWithMotto: {
    transform: [{ translateY: FRIEND_MOTTO_CHARACTER_OFFSET_Y }],
  },
  speechBubble: {
    position: 'absolute',
    zIndex: 2,
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
    right: theme.foundation.spacing[1.5],
    bottom: theme.foundation.spacing[1.5],
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
