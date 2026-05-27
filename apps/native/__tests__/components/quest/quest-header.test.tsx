import { render } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';

import { NotificationBellIcon } from '@/components/icons/notification-icons';
import QuestHeader from '@/components/quest/quest-header';

const mockUseReceivedRequests = jest.fn();

declare const mockAuthStore: {
  user: { nickname: string; role: 'ADMIN' | 'USER' } | null;
};

jest.mock('@/hooks/useReceivedRequests', () => ({
  useReceivedRequests: (nickname: string) => mockUseReceivedRequests(nickname),
}));

jest.mock('@/components/icons/notification-icons', () => {
  const React = require('react');
  const { View: MockView } = require('react-native');

  return {
    NotificationBellIcon: jest.fn(({ size }) =>
      React.createElement(MockView, {
        testID: 'notification-bell-icon',
        style: { width: size, height: size },
      }),
    ),
  };
});

describe('QuestHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.user = {
      nickname: 'testuser',
      role: 'ADMIN',
    };
    mockUseReceivedRequests.mockReturnValue({ data: [] });
  });

  it('renders only the quest title and compact notification bell in the header', () => {
    const { getByLabelText, getByText, queryByText } = render(<QuestHeader />);

    expect(getByText('퀘스트 목록')).toBeOnTheScreen();
    expect(getByLabelText('인증 요청 알림')).toBeOnTheScreen();
    expect(queryByText('추가')).not.toBeOnTheScreen();
    expect(jest.mocked(NotificationBellIcon).mock.calls[0][0]).toEqual({
      size: 16,
    });
  });

  it('does not apply a temporary debug color to the header background', () => {
    const screen = render(<QuestHeader />);

    const debugHeaderViews = screen
      .UNSAFE_getAllByType(View)
      .filter(
        (node) =>
          StyleSheet.flatten(node.props.style)?.backgroundColor === '#FF00A8',
      );

    expect(debugHeaderViews).toHaveLength(0);
  });
});
