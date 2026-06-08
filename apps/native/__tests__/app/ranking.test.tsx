import {
  useAllLevelRankingQuery,
  useAllStatRankingsQuery,
  useFriendLevelRankingQuery,
  useStatRankingQuery,
} from '@repo/shared/hooks/useRanking';
import { fireEvent } from '@testing-library/react-native';

import RankingPage from '../../app/(tabs)/(afterLogin)/(ranking)/index';
import { render } from '../setup/test-utils';

jest.mock('@repo/shared/hooks/useRanking', () => ({
  useAllLevelRankingQuery: jest.fn(),
  useAllStatRankingsQuery: jest.fn(),
  useFriendLevelRankingQuery: jest.fn(),
  useStatRankingQuery: jest.fn(),
}));

describe('RankingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAllLevelRankingQuery).mockReturnValue({
      data: [
        {
          userId: 1,
          nickname: '레벨왕',
          level: 21,
          totalExp: 950,
          rank: 1,
        },
      ],
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAllLevelRankingQuery>);
    jest.mocked(useFriendLevelRankingQuery).mockReturnValue({
      data: [
        {
          userId: 2,
          nickname: '친구왕',
          level: 18,
          totalExp: 780,
          rank: 1,
        },
      ],
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useFriendLevelRankingQuery>);
    jest.mocked(useStatRankingQuery).mockReturnValue({
      data: [
        {
          userId: 3,
          nickname: '힘왕',
          statType: 'STRENGTH',
          value: 34,
          rank: 1,
        },
      ],
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useStatRankingQuery>);
    jest.mocked(useAllStatRankingsQuery).mockReturnValue({
      data: {
        STRENGTH: [
          {
            userId: 4,
            nickname: '전체힘왕',
            statType: 'STRENGTH',
            value: 45,
            rank: 1,
          },
          {
            userId: 6,
            nickname: '힘도전자',
            statType: 'STRENGTH',
            value: 39,
            rank: 2,
          },
        ],
        MANA: [
          {
            userId: 5,
            nickname: '전체마나왕',
            statType: 'MANA',
            value: 31,
            rank: 1,
          },
        ],
      },
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAllStatRankingsQuery>);
  });

  it('전체 레벨 랭킹을 기본 화면으로 보여준다', () => {
    const { getByText } = render(<RankingPage />);

    expect(getByText('랭킹')).toBeOnTheScreen();
    expect(getByText('전체')).toBeOnTheScreen();
    expect(getByText('레벨왕')).toBeOnTheScreen();
    expect(getByText('Lv. 21')).toBeOnTheScreen();
    expect(useAllLevelRankingQuery).toHaveBeenCalledWith(50, {
      enabled: true,
    });
    expect(useFriendLevelRankingQuery).toHaveBeenCalledWith({
      enabled: false,
    });
    expect(useStatRankingQuery).toHaveBeenCalledWith('STRENGTH', 10, {
      enabled: false,
    });
    expect(useAllStatRankingsQuery).toHaveBeenCalledWith(10, {
      enabled: false,
    });
  });

  it('친구 레벨 랭킹으로 전환한다', () => {
    const { getByText } = render(<RankingPage />);

    fireEvent.press(getByText('친구'));

    expect(getByText('친구왕')).toBeOnTheScreen();
    expect(useFriendLevelRankingQuery).toHaveBeenCalled();
  });

  it('스탯 랭킹에서 선택한 스탯 랭킹을 보여준다', () => {
    const { getByText } = render(<RankingPage />);

    fireEvent.press(getByText('스탯'));

    expect(getByText('힘왕')).toBeOnTheScreen();
    expect(getByText('34')).toBeOnTheScreen();
    expect(useStatRankingQuery).toHaveBeenCalledWith('STRENGTH', 10, {
      enabled: true,
    });
  });

  it('전체 스탯 랭킹으로 전환하면 스탯별 랭킹을 보여준다', () => {
    const { getByText } = render(<RankingPage />);

    fireEvent.press(getByText('스탯'));
    fireEvent.press(getByText('전체'));

    expect(getByText('전체힘왕')).toBeOnTheScreen();
    expect(getByText('힘도전자')).toBeOnTheScreen();
    expect(getByText('전체마나왕')).toBeOnTheScreen();
    expect(getByText('45')).toBeOnTheScreen();
    expect(useAllStatRankingsQuery).toHaveBeenCalledWith(10, {
      enabled: true,
    });
  });
});
