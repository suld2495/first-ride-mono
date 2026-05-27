import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import { StyleSheet, View } from 'react-native';

import { useQuestStore } from '@/store/quest.store';

import QuestPage from '../../app/(tabs)/(afterLogin)/(quest)/index';
import { createMockQuest } from '../setup/quest/mock';
import { render } from '../setup/test-utils';

jest.mock('@repo/shared/hooks/useQuest', () => ({
  useFetchQuestsQuery: jest.fn(),
}));

jest.mock('@/hooks/useReceivedRequests', () => ({
  useReceivedRequests: jest.fn(() => ({ data: [] })),
}));

describe('QuestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuestStore.setState({
      questId: null,
      statusFilter: 'ALL',
      typeFilter: 'WEEKLY',
    });
    jest.mocked(useFetchQuestsQuery).mockReturnValue({
      data: [createMockQuest()],
      isLoading: false,
    } as ReturnType<typeof useFetchQuestsQuery>);
  });

  it('does not render the quest type filter or pass questType to the quest query', () => {
    const { queryByText } = render(<QuestPage />);

    expect(queryByText('일일')).not.toBeOnTheScreen();
    expect(queryByText('주간')).not.toBeOnTheScreen();
    expect(useFetchQuestsQuery).toHaveBeenCalledWith({
      status: 'ALL',
    });
  });

  it('keeps an 8px gap between the status filters and quest list', () => {
    const screen = render(<QuestPage />);

    const filterListStack = screen.UNSAFE_getAllByType(View).find((node) => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.paddingHorizontal === 16 && style?.gap === 8;
    });

    expect(StyleSheet.flatten(filterListStack?.props.style)).toMatchObject({
      gap: 8,
    });
  });
});
