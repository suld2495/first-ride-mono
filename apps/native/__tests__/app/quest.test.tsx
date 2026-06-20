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
      statusFilter: 'ACTIVE',
      typeFilter: 'WEEKLY',
    });
    jest.mocked(useFetchQuestsQuery).mockReturnValue({
      data: [createMockQuest()],
      isLoading: false,
    } as ReturnType<typeof useFetchQuestsQuery>);
  });

  it('shows status filters and requests active incomplete quests without the quest type filter', () => {
    const { getByText, queryByText } = render(<QuestPage />);

    expect(queryByText('일일')).not.toBeOnTheScreen();
    expect(queryByText('주간')).not.toBeOnTheScreen();
    expect(getByText('전체')).toBeOnTheScreen();
    expect(getByText('진행전')).toBeOnTheScreen();
    expect(getByText('진행중')).toBeOnTheScreen();
    expect(queryByText('만료')).not.toBeOnTheScreen();
    expect(queryByText('예정')).not.toBeOnTheScreen();
    expect(useFetchQuestsQuery).toHaveBeenCalledWith({
      status: 'ACTIVE',
      completed: false,
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

  it('shows the same incomplete quest list when the all status filter is selected', () => {
    useQuestStore.setState({ statusFilter: 'ALL' });
    jest.mocked(useFetchQuestsQuery).mockReturnValue({
      data: [createMockQuest(0), createMockQuest(1), createMockQuest(2)],
      isLoading: false,
    } as ReturnType<typeof useFetchQuestsQuery>);

    const { getByText } = render(<QuestPage />);

    expect(getByText('테스트 퀘스트 1')).toBeOnTheScreen();
    expect(getByText('테스트 퀘스트 2')).toBeOnTheScreen();
    expect(getByText('테스트 퀘스트 3')).toBeOnTheScreen();
    expect(useFetchQuestsQuery).toHaveBeenCalledWith({
      status: 'ACTIVE',
      completed: false,
    });
  });

  it('shows the same incomplete quest list when the upcoming status filter is selected', () => {
    useQuestStore.setState({ statusFilter: 'UPCOMING' });
    jest.mocked(useFetchQuestsQuery).mockReturnValue({
      data: [createMockQuest(0), createMockQuest(1)],
      isLoading: false,
    } as ReturnType<typeof useFetchQuestsQuery>);

    const { getByText } = render(<QuestPage />);

    expect(getByText('테스트 퀘스트 1')).toBeOnTheScreen();
    expect(getByText('테스트 퀘스트 2')).toBeOnTheScreen();
    expect(useFetchQuestsQuery).toHaveBeenCalledWith({
      status: 'ACTIVE',
      completed: false,
    });
  });
});
