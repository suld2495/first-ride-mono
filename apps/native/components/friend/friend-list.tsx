import type { Friend } from '@repo/types';
import { useCallback, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import {
  Image,
  Modal,
  Pressable,
  View,
  type GestureResponderEvent,
  type ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';

import { RoutineRequestIcon } from '@/components/icons/routine-icons';
import {
  CONTEXT_MENU_WIDTH,
  ContextMenuPanel,
  type ContextMenuItem,
} from '@/components/routine/routine-context-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { FlashList } from '@/components/ui/flash-list';
import { IconButton } from '@/components/ui/icon-button';
import { Loading } from '@/components/ui/loading';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import CharacterSpeechBubble from '@/feature/character/character-speech-bubble';
import { appThemes, type ThemeName } from '@/theme/themes';
import { baseFoundation, palette } from '@/theme/tokens';

interface FriendItemProps {
  friend: Friend;
  itemWidth: number;
  screenWidth: number;
  isRightColumn: boolean;
  onOpen: (friend: Friend) => void;
  onDelete?: (friend: Friend) => void;
  isDeleting: boolean;
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
const FRIEND_CHARACTER_SIZE_INCREMENT = 46;
const FRIEND_LIST_HORIZONTAL_PADDING = baseFoundation.spacing[6];
const FRIEND_GRID_COLUMN_GAP = baseFoundation.spacing[4];
const FRIEND_GRID_ROW_GAP = baseFoundation.spacing[2];
const FRIEND_GRID_COLUMN_COUNT = 2;
const FRIEND_MOTTO_CHARACTER_OFFSET_Y = 13;
const FRIEND_MOTTO_BUBBLE_MIN_WIDTH = 80;
const FRIEND_MOTTO_BUBBLE_HORIZONTAL_MARGIN = baseFoundation.spacing[2];
const FRIEND_MOTTO_BUBBLE_VERTICAL_PADDING = 5;
const FRIEND_MOTTO_BUBBLE_TOP_MARGIN =
  baseFoundation.spacing[1.5] + baseFoundation.spacing[2];
const FRIEND_MOTTO_BUBBLE_CHARACTER_GAP = baseFoundation.dimension.x2;
const FRIEND_MOTTO_MAX_LINE_COUNT = 2;
const FRIEND_MOTTO_LINE_HEIGHT = 16;
const FRIEND_MOTTO_BUBBLE_DISPLAY_TOP =
  FRIEND_MOTTO_BUBBLE_TOP_MARGIN + FRIEND_MOTTO_LINE_HEIGHT;
const FRIEND_MOTTO_BUBBLE_BORDER_WIDTH = 2;
const FRIEND_MOTTO_BUBBLE_TAIL_SPACE = baseFoundation.spacing[2];
const FRIEND_MOTTO_BUBBLE_SINGLE_LINE_MAX_WIDTH = 118;
const FRIEND_MOTTO_BUBBLE_SINGLE_LINE_HEIGHT =
  FRIEND_MOTTO_LINE_HEIGHT +
  FRIEND_MOTTO_BUBBLE_VERTICAL_PADDING * 2 +
  FRIEND_MOTTO_BUBBLE_BORDER_WIDTH * 2;
const FRIEND_MOTTO_BUBBLE_TWO_LINE_HEIGHT =
  FRIEND_MOTTO_MAX_LINE_COUNT * FRIEND_MOTTO_LINE_HEIGHT +
  FRIEND_MOTTO_BUBBLE_VERTICAL_PADDING * 2 +
  FRIEND_MOTTO_BUBBLE_BORDER_WIDTH * 2;
const FRIEND_MOTTO_MAX_BUBBLE_HEIGHT =
  FRIEND_MOTTO_BUBBLE_TWO_LINE_HEIGHT + FRIEND_MOTTO_BUBBLE_TAIL_SPACE;
const FRIEND_NICKNAME_ACTION_ROW_HEIGHT = baseFoundation.dimension.x32;
const FRIEND_ACTION_MENU_MARGIN = baseFoundation.spacing[2];
const FRIEND_ITEM_TEXT_BLOCK_HEIGHT =
  baseFoundation.spacing[2] +
  FRIEND_NICKNAME_ACTION_ROW_HEIGHT +
  baseFoundation.dimension.x10 +
  baseFoundation.typography.size.body2 +
  baseFoundation.typography.size.body3 +
  FRIEND_GRID_ROW_GAP;

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

  return (
    Math.min(widthBasedImageSize, heightBasedImageSize) +
    FRIEND_CHARACTER_SIZE_INCREMENT
  );
};

const getFriendCharacterSource = (
  characterImageUrl: Friend['characterImageUrl'],
): ImageSourcePropType | null => {
  if (typeof characterImageUrl !== 'string' || !characterImageUrl.trim()) {
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
  const normalizedCharacter =
    `${characterCode ?? ''} ${job ?? ''}`.toUpperCase();

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
  screenWidth,
  isRightColumn,
  onOpen,
  onDelete,
  isDeleting,
}: FriendItemProps) => {
  const { theme } = useAppTheme();
  const menuAnchorRef = useRef<View>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const { userId, nickname, job, level, characterCode, characterImageUrl } =
    friend;
  const displayNickname =
    typeof nickname === 'string' && nickname.trim() ? nickname : '친구';
  const subtitle = typeof userId === 'string' ? userId.trim() : '';
  const motto = typeof friend.motto === 'string' ? friend.motto.trim() : '';
  const displayLevel =
    typeof level === 'number' && Number.isFinite(level)
      ? Math.max(1, Math.floor(level))
      : 1;
  const hasMotto = motto.length > 0;
  const characterImageSize = getFriendCharacterImageSize(itemWidth);
  const characterSource = getFriendCharacterSource(characterImageUrl);
  const characterThemeName = getFriendCharacterThemeName({
    characterCode,
    job,
  });
  const testIdSuffix = displayNickname;
  const characterStyle = [
    { width: characterImageSize, height: characterImageSize },
    hasMotto ? styles.characterWithMotto : null,
  ];
  const handleCloseMenu = () => setIsMenuOpen(false);
  const handleToggleMenu = (event: GestureResponderEvent) => {
    event.stopPropagation();

    if (isDeleting) {
      return;
    }

    if (isMenuOpen) {
      handleCloseMenu();
      return;
    }

    menuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      const maxLeft = Math.max(
        FRIEND_ACTION_MENU_MARGIN,
        screenWidth - CONTEXT_MENU_WIDTH - FRIEND_ACTION_MENU_MARGIN,
      );
      const left = Math.min(
        Math.max(x + width - CONTEXT_MENU_WIDTH, FRIEND_ACTION_MENU_MARGIN),
        maxLeft,
      );

      setMenuPosition({
        top: y + height + FRIEND_ACTION_MENU_MARGIN,
        left,
      });
      setIsMenuOpen(true);
    });
  };
  const actionMenuItems: ContextMenuItem[] = [
    {
      label: '친구 삭제',
      onPress: () => {
        handleCloseMenu();
        onDelete?.(friend);
      },
      color: palette.theme.red[50],
    },
  ];

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isRightColumn ? styles.rightColumnCard : null,
          { width: itemWidth },
          pressed ? styles.cardPressed : null,
        ]}
        onPress={() => onOpen(friend)}
        accessibilityRole="button"
        accessibilityLabel={`${displayNickname} 루틴 보기`}
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
              multiLineContainerHeight={FRIEND_MOTTO_BUBBLE_TWO_LINE_HEIGHT}
              multiLineMaxWidth={
                itemWidth - FRIEND_MOTTO_BUBBLE_HORIZONTAL_MARGIN * 2
              }
              message={motto}
              numberOfLines={2}
              singleLineContainerHeight={FRIEND_MOTTO_BUBBLE_SINGLE_LINE_HEIGHT}
              singleLineMaxWidth={FRIEND_MOTTO_BUBBLE_SINGLE_LINE_MAX_WIDTH}
              singleLineWrapperTop={FRIEND_MOTTO_BUBBLE_DISPLAY_TOP}
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
              accessibilityLabel={`${displayNickname} 캐릭터`}
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
              Lv. {displayLevel}
            </Typography>
          </View>
        </ThemeView>

        <View style={styles.nicknameRow}>
          <Typography
            variant="body2"
            weight="semibold"
            style={styles.nickname}
            numberOfLines={1}
          >
            {displayNickname}
          </Typography>
          {onDelete ? (
            <View style={styles.kebabAnchor}>
              <View
                ref={menuAnchorRef}
                collapsable={false}
                style={styles.kebabButtonAnchor}
              >
                <IconButton
                  testID={`friend-menu-button-${testIdSuffix}`}
                  accessibilityLabel={`${displayNickname} 친구 메뉴 열기`}
                  accessibilityRole="button"
                  disabled={isDeleting}
                  hitSlop={baseFoundation.spacing[1.5]}
                  loading={isDeleting}
                  onPress={handleToggleMenu}
                  size="sm"
                  style={styles.kebabButton}
                  variant="ghost"
                  icon={() => (
                    <RoutineRequestIcon
                      color={theme.colors.brand.routineProgressText}
                    />
                  )}
                />
              </View>
            </View>
          ) : null}
        </View>
        <Typography variant="body3" style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Typography>
      </Pressable>

      {onDelete ? (
        <Modal
          animationType="fade"
          transparent
          visible={isMenuOpen}
          onRequestClose={handleCloseMenu}
          statusBarTranslucent
        >
          <View
            style={styles.actionMenuOverlay}
            accessibilityViewIsModal
            testID={`friend-action-menu-overlay-${testIdSuffix}`}
          >
            <Pressable
              accessibilityLabel="친구 메뉴 닫기"
              onPress={handleCloseMenu}
              style={styles.actionMenuDismissArea}
            />
            <ContextMenuPanel
              items={actionMenuItems}
              style={[
                styles.actionMenuPosition,
                { top: menuPosition.top, left: menuPosition.left },
              ]}
              testID={`friend-action-menu-${testIdSuffix}`}
              itemTestID={`friend-delete-menu-item-${testIdSuffix}`}
              itemTextTestID={`friend-delete-menu-text-${testIdSuffix}`}
            />
          </View>
        </Modal>
      ) : null}
    </>
  );
};

interface FriendListProps {
  friends?: Friend[];
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onOpenFriend: (friend: Friend) => void;
  onDeleteFriend?: (friend: Friend) => void;
  isDeletingFriend?: boolean;
  listHeaderComponent?: ReactElement;
}

const FriendList = ({
  friends,
  isLoading,
  refreshing,
  onRefresh,
  onOpenFriend,
  onDeleteFriend,
  isDeletingFriend = false,
  listHeaderComponent,
}: FriendListProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const { itemWidth } = getFriendItemLayoutSize(screenWidth);
  const itemHeight = itemWidth + FRIEND_ITEM_TEXT_BLOCK_HEIGHT;
  const safeFriends = Array.isArray(friends) ? friends : [];

  const renderFriendItem = useCallback(
    ({ index, item }: FriendRenderItemProps) => (
      <FriendItem
        friend={item}
        itemWidth={itemWidth}
        screenWidth={screenWidth}
        isRightColumn={index % 2 === 1}
        isDeleting={isDeletingFriend}
        onDelete={onDeleteFriend}
        onOpen={onOpenFriend}
      />
    ),
    [isDeletingFriend, itemWidth, onDeleteFriend, onOpenFriend, screenWidth],
  );
  const getFriendItemLayout = useCallback(
    (_: Friend[] | null, index: number) => ({
      length: itemHeight,
      offset: itemHeight * Math.floor(index / FRIEND_GRID_COLUMN_COUNT),
      index,
    }),
    [itemHeight],
  );

  return (
    <FlashList
      data={isLoading ? [] : safeFriends}
      keyExtractor={(item, index) =>
        `${String(item.friendId ?? item.nickname ?? 'friend')}-${index}`
      }
      renderItem={renderFriendItem}
      contentContainerStyle={[
        styles.listContent,
        listHeaderComponent ? styles.listContentWithHeader : null,
      ]}
      columnWrapperStyle={styles.row}
      style={styles.list}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={
        isLoading ? (
          <Loading />
        ) : (
          <EmptyState icon="people-outline" message="친구를 추가해보세요." />
        )
      }
      ListHeaderComponent={listHeaderComponent}
      getItemLayout={getFriendItemLayout}
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
  listContentWithHeader: {
    paddingTop: theme.foundation.spacing[0],
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    alignItems: 'center',
    marginBottom: FRIEND_GRID_ROW_GAP,
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
  nicknameRow: {
    width: '100%',
    minHeight: FRIEND_NICKNAME_ACTION_ROW_HEIGHT,
    marginTop: theme.foundation.spacing[2],
    justifyContent: 'center',
    position: 'relative',
  },
  kebabAnchor: {
    position: 'absolute',
    top: theme.foundation.spacing[0],
    bottom: theme.foundation.spacing[0],
    right: theme.foundation.spacing[0],
    width: baseFoundation.dimension.x20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  kebabButtonAnchor: {
    width: baseFoundation.dimension.x20,
    height: baseFoundation.dimension.x20,
  },
  kebabButton: {
    width: baseFoundation.dimension.x20,
    height: baseFoundation.dimension.x20,
    borderRadius: 0,
  },
  actionMenuOverlay: {
    flex: 1,
  },
  actionMenuDismissArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  actionMenuPosition: {
    position: 'absolute',
    right: undefined,
  },
  characterPanelBlue: {
    backgroundColor: appThemes.blue.colors.brand.primary,
  },
  characterPanelGreen: {
    backgroundColor: appThemes.green.colors.brand.primary,
  },
  characterPanelRed: {
    backgroundColor: appThemes.red.colors.brand.primary,
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
    paddingHorizontal: FRIEND_NICKNAME_ACTION_ROW_HEIGHT,
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
