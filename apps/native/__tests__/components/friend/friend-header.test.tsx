import { render } from '@testing-library/react-native';

import FriendHeader from '@/components/friend/friend-header';
import { NotificationBellIcon } from '@/components/icons/notification-icons';

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

jest.mock('@/components/icons/notification-icons', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    NotificationBellIcon: jest.fn(({ size }) =>
      React.createElement(View, {
        testID: 'notification-bell-icon',
        style: { width: size, height: size },
      }),
    ),
  };
});

describe('FriendHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the notification bell at the compact header action size', () => {
    render(<FriendHeader requestCount={0} />);

    expect(jest.mocked(NotificationBellIcon).mock.calls[0][0]).toEqual({
      size: 16,
    });
  });

  it('keeps the notification bell at the fixed header action position', () => {
    const { getByLabelText } = render(<FriendHeader requestCount={0} />);

    const notificationButton = getByLabelText('친구 요청 알림');

    expect(flattenPressableStyles(notificationButton.props.style)).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 24 })]),
    );
  });
});
