import { render } from '@testing-library/react-native';
import { FlatList } from 'react-native';

import FriendList from '@/components/friend/friend-list';
import { createMockFriends } from '../../setup/friend/mock';

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
      expect.arrayContaining([
        expect.objectContaining({ marginLeft: 'auto' }),
      ]),
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
});
