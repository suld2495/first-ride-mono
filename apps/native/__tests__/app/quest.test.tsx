import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import { StyleSheet, View } from 'react-native';

import { useColorSchemeStore } from '@/store/color-scheme.store';
import { useQuestStore } from '@/store/quest.store';
import { appThemes } from '@/theme/themes';

import QuestPage from '../../app/(tabs)/(afterLogin)/(quest)/index';
import { createMockQuest } from '../setup/quest/mock';
import { act, render } from '../setup/test-utils';

declare const mockAuthStore: {
  user: { nickname: string; role: 'ADMIN' | 'USER'; userId: string } | null;
};
declare const mockFocus: jest.Mock;

jest.mock('@repo/shared/hooks/useQuest', () => ({
  useFetchQuestsQuery: jest.fn(),
}));

jest.mock('@/hooks/useReceivedRequests', () => ({
  useReceivedRequests: jest.fn(() => ({ data: [] })),
}));

describe('QuestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useColorSchemeStore.getState().clearColorSchemeOverride();
    useColorSchemeStore.getState().setColorScheme('blue');
    mockAuthStore.user = {
      nickname: 'testuser',
      role: 'USER',
      userId: 'test123',
    };
    useQuestStore.setState({
      questId: null,
      statusFilter: 'ACTIVE',
      typeFilter: 'WEEKLY',
    });
    jest.mocked(useFetchQuestsQuery).mockReturnValue({
      data: [createMockQuest()],
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useFetchQuestsQuery>);
    mockFocus.mockClear();
  });

  it('shows status filters and requests active incomplete quests without the quest type filter', () => {
    const { getByText, queryByText } = render(<QuestPage />);

    expect(queryByText('일일')).not.toBeOnTheScreen();
    expect(queryByText('주간')).not.toBeOnTheScreen();
    expect(getByText('전체')).toBeOnTheScreen();
    expect(queryByText('진행전')).not.toBeOnTheScreen();
    expect(getByText('진행중')).toBeOnTheScreen();
    expect(queryByText('만료')).not.toBeOnTheScreen();
    expect(queryByText('예정')).not.toBeOnTheScreen();
    expect(useFetchQuestsQuery).toHaveBeenCalledWith('test123', {
      status: 'ACTIVE',
      completed: false,
    });
  });

  it('refetches quests when the page receives focus again', () => {
    const refetch = jest.fn();
    jest.mocked(useFetchQuestsQuery).mockReturnValue({
      data: [createMockQuest()],
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useFetchQuestsQuery>);

    render(<QuestPage />);

    act(() => {
      mockFocus();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps an 8px gap between the status filters and quest list', () => {
    const screen = render(<QuestPage />);

    const filterListStack = screen.UNSAFE_getAllByType(View).find((node) => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.paddingHorizontal === 24 && style?.gap === 8;
    });

    expect(StyleSheet.flatten(filterListStack?.props.style)).toMatchObject({
      gap: 8,
    });
  });

  it('친구 테마 override가 남아 있어도 퀘스트 목록 배경은 내 테마로 표시한다', () => {
    useColorSchemeStore.getState().setColorScheme('blue');
    useColorSchemeStore.getState().setColorSchemeOverride('green');

    const { getByTestId } = render(<QuestPage />);

    expect(getByTestId('quest-page')).toHaveStyle({
      backgroundColor: appThemes.blue.colors.background.base,
    });
    expect(useColorSchemeStore.getState().colorSchemeOverride).toBeNull();
  });

  it('uses the friend add button style for the admin quest add button', () => {
    mockAuthStore.user = {
      nickname: 'admin',
      role: 'ADMIN',
      userId: 'test123',
    };

    const { getByTestId, getByText } = render(<QuestPage />);

    expect(getByText('추가')).toBeOnTheScreen();
    expect(getByTestId('quest-add-button')).toHaveStyle({
      height: 28,
      minHeight: 28,
      borderRadius: 8,
      backgroundColor: '#111827',
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
    expect(useFetchQuestsQuery).toHaveBeenCalledWith('test123', {
      status: 'ACTIVE',
      completed: false,
    });
  });
});
