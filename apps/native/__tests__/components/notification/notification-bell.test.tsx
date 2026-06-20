import { render } from '@testing-library/react-native';

import { NotificationBellIcon } from '@/components/icons/notification-icons';
import NotificationBell from '@/components/notification/notification-bell';

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

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the notification bell as an svg icon', () => {
    const { getByTestId } = render(<NotificationBell count={0} />);

    expect(getByTestId('notification-bell-icon')).toBeOnTheScreen();
  });

  it('does not pass a color to the notification bell icon', () => {
    render(<NotificationBell count={0} />);

    expect(jest.mocked(NotificationBellIcon).mock.calls[0][0]).toEqual({
      size: 20,
    });
  });
});
