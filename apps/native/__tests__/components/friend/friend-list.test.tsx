import { render } from '@testing-library/react-native';
import { FlatList } from 'react-native';

import FriendList from '@/components/friend/friend-list';
import { appThemes } from '@/theme/themes';

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

  it('sizes friend cards so the horizontal gap is 16', () => {
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

    expect(firstCardWidth).toBe(347);
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
  });
});
