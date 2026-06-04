import { fireEvent, render } from '@testing-library/react-native';
import { FlatList, StyleSheet } from 'react-native';

import FriendList from '@/components/friend/friend-list';
import { appThemes } from '@/theme/themes';
import { palette } from '@/theme/tokens';

import { createMockFriend, createMockFriends } from '../../setup/friend/mock';

const flattenStyles = (styles: unknown): object[] => {
  if (!styles) return [];
  if (Array.isArray(styles)) {
    return styles.flatMap((style) => flattenStyles(style));
  }

  return [styles as object];
};

const flattenPressableStyles = (style: unknown): object[] => {
  if (typeof style === 'function') {
    return flattenStyles(style({ pressed: false }));
  }

  return flattenStyles(style);
};

describe('FriendList', () => {
  it('aligns friend cards to the row edges', () => {
    const friends = createMockFriends(3);
    const { UNSAFE_getByType } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );

    const list = UNSAFE_getByType(FlatList);

    expect(flattenStyles(list.props.columnWrapperStyle)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ justifyContent: 'space-between' }),
      ]),
    );
  });

  it('keeps enough vertical space between friend rows', () => {
    const friends = createMockFriends(3);
    const { getByLabelText } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );

    expect(
      flattenPressableStyles(getByLabelText('friend1 루틴 보기').props.style),
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginBottom: 20 })]),
    );
  });

  it('pushes right-column friend cards to the right edge', () => {
    const friends = createMockFriends(3);
    const { getByLabelText } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );

    expect(
      flattenPressableStyles(getByLabelText('friend2 루틴 보기').props.style),
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginLeft: 'auto' })]),
    );
  });

  it('sizes friend cards so the horizontal gap is 16 and motto characters fit the height budget', () => {
    const friends = createMockFriends(2);
    const { getByLabelText } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );
    const firstCardWidth = flattenPressableStyles(
      getByLabelText('friend1 루틴 보기').props.style,
    ).find((style) => 'width' in style)?.width;
    const firstCharacterStyle = StyleSheet.flatten(
      getByLabelText('friend1 캐릭터').props.style,
    );

    expect(firstCardWidth).toBe(347);
    expect(firstCharacterStyle).toEqual(
      expect.objectContaining({
        height: 257,
        width: 257,
      }),
    );
  });

  it('keeps character size independent from motto presence', () => {
    const friends = [
      createMockFriend(0, {
        motto: null,
        mottos: [],
      }),
    ];
    const { getByLabelText } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );
    const characterStyle = StyleSheet.flatten(
      getByLabelText('friend1 캐릭터').props.style,
    );

    expect(characterStyle).toEqual(
      expect.objectContaining({
        height: 257,
        width: 257,
      }),
    );
  });

  it('shows the friend motto in a speech bubble above the character', () => {
    const friends = [
      createMockFriend(0, {
        nickname: 'Fffft',
        userId: 'Fff1234',
        motto: '오늘 할일을 내일로 미루지 말고 내일 할일도 오늘로 당겨보자',
        job: '검사',
      }),
    ];
    const { getByLabelText, getByTestId, getByText } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );

    expect(getByText('Fffft')).toBeOnTheScreen();
    expect(getByText('Fff1234')).toBeOnTheScreen();

    const motto = getByText(
      '오늘 할일을 내일로 미루지 말고 내일 할일도 오늘로 당겨보자',
    );
    const speechBubble = getByTestId('friend-character-speech-bubble-Fffft');
    const speechBubbleContainer = getByTestId(
      'friend-character-speech-bubble-Fffft-container',
    );
    const character = getByLabelText('Fffft 캐릭터');

    expect(motto.props.numberOfLines).toBe(2);
    expect(motto.props.ellipsizeMode).toBe('tail');
    expect(motto.props.fontSize).toBe('$caption2');
    expect(motto.props.fontWeight).toBe('600');
    expect(motto.props.textAlign).toBe('center');
    expect(StyleSheet.flatten(motto.props.style)).toEqual(
      expect.objectContaining({
        alignSelf: 'stretch',
        color: palette.theme.gray[90],
        textAlign: 'center',
      }),
    );
    expect(StyleSheet.flatten(speechBubble.props.style)).toEqual(
      expect.objectContaining({
        position: 'absolute',
        top: 6,
      }),
    );
    expect(StyleSheet.flatten(speechBubbleContainer.props.style)).toEqual(
      expect.objectContaining({
        maxWidth: 331,
        minWidth: 80,
        paddingBottom: 5,
        paddingTop: 5,
      }),
    );
    expect(
      StyleSheet.flatten(speechBubbleContainer.props.style).minHeight,
    ).toBe(undefined);
    expect(StyleSheet.flatten(character.props.style)).toEqual(
      expect.objectContaining({
        transform: [{ translateY: 17 }],
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('friend-level-badge-Fffft').props.style),
    ).toEqual(
      expect.objectContaining({
        bottom: 6,
        right: 6,
      }),
    );
  });

  it('keeps the speech bubble bottom text line fixed for one-line mottos', () => {
    const friends = [
      createMockFriend(0, {
        nickname: 'Shorty',
        motto: '짧은 한마디',
      }),
    ];
    const { getByTestId, getByText } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );
    const motto = getByText('짧은 한마디');

    fireEvent(motto, 'textLayout', { nativeEvent: { lines: [{}] } });

    expect(
      StyleSheet.flatten(
        getByTestId('friend-character-speech-bubble-Shorty').props.style,
      ),
    ).toEqual(
      expect.objectContaining({
        top: 22,
      }),
    );
  });

  it('does not show a speech bubble when the friend has no motto', () => {
    const friends = [
      createMockFriend(0, {
        nickname: 'Fffft',
        userId: 'Fff1234',
        motto: null,
        mottos: [],
      }),
    ];
    const { queryByTestId } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );

    expect(queryByTestId('friend-character-speech-bubble-Fffft')).toBeNull();
  });

  it('uses each friend character color for the character panel and level badge', () => {
    const friends = [
      createMockFriend(0, {
        nickname: 'warrior',
        characterCode: 'WARRIOR_INTERMEDIATE',
      }),
      createMockFriend(1, {
        nickname: 'mage',
        characterCode: 'MAGE_INTERMEDIATE',
      }),
      createMockFriend(2, {
        nickname: 'archer',
        characterCode: 'ARCHER_INTERMEDIATE',
      }),
    ];
    const { getByTestId } = render(
      <FriendList
        friends={friends}
        isLoading={false}
        refreshing={false}
        onRefresh={jest.fn()}
        onOpenFriend={jest.fn()}
      />,
    );

    expect(
      flattenStyles(getByTestId('friend-character-panel-warrior').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: appThemes.blue.colors.brand.card,
        }),
      ]),
    );
    expect(
      flattenStyles(getByTestId('friend-level-badge-warrior').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: appThemes.blue.colors.brand.background,
        }),
      ]),
    );
    expect(getByTestId('friend-level-text-warrior')).toHaveStyle({
      color: appThemes.blue.colors.brand.text,
    });
    expect(
      getByTestId('friend-level-text-warrior').props.color,
    ).toBeUndefined();
    expect(
      StyleSheet.flatten(
        getByTestId('friend-character-speech-bubble-warrior-container').props
          .style,
      ),
    ).toEqual(
      expect.objectContaining({
        borderColor: palette.theme.blue[50],
      }),
    );

    expect(
      flattenStyles(getByTestId('friend-character-panel-mage').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: appThemes.red.colors.brand.card,
        }),
      ]),
    );
    expect(
      flattenStyles(getByTestId('friend-level-badge-mage').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: appThemes.red.colors.brand.background,
        }),
      ]),
    );
    expect(getByTestId('friend-level-text-mage')).toHaveStyle({
      color: appThemes.red.colors.brand.text,
    });
    expect(getByTestId('friend-level-text-mage').props.color).toBeUndefined();
    expect(
      StyleSheet.flatten(
        getByTestId('friend-character-speech-bubble-mage-container').props
          .style,
      ),
    ).toEqual(
      expect.objectContaining({
        borderColor: palette.theme.red[50],
      }),
    );

    expect(
      flattenStyles(getByTestId('friend-character-panel-archer').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: appThemes.green.colors.brand.card,
        }),
      ]),
    );
    expect(
      flattenStyles(getByTestId('friend-level-badge-archer').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: appThemes.green.colors.brand.background,
        }),
      ]),
    );
    expect(getByTestId('friend-level-text-archer')).toHaveStyle({
      color: appThemes.green.colors.brand.text,
    });
    expect(getByTestId('friend-level-text-archer').props.color).toBeUndefined();
    expect(
      StyleSheet.flatten(
        getByTestId('friend-character-speech-bubble-archer-container').props
          .style,
      ),
    ).toEqual(
      expect.objectContaining({
        borderColor: palette.theme.green[50],
      }),
    );
  });
});
