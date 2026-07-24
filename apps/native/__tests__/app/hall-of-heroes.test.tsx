import { fireEvent, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import HallOfHeroesPage from '@/app/hall-of-heroes';
import { baseFoundation, palette } from '@/theme/tokens';

import { render } from '../setup/test-utils';

declare const mockBack: jest.Mock;

const WARRIOR_DESCRIPTION =
  '이루라의 모험이 흔들리지 않도록 길을 만들고 시스템을 지키는 전사입니다.\n작은 루틴이 꾸준한 성장으로 이어질 수 있도록, 아이디어를 기능으로 만들고 문제 앞에서는 가장 먼저 검을 듭니다. ⚔️';
const ARCHER_DESCRIPTION =
  '이루라의 모험이 올바른 방향으로 나아가도록 멀리 내다보고 길을 밝히는 궁수입니다.\n작은 루틴이 정확한 목표에 닿을 수 있도록, 사용자의 목소리에 귀 기울이고 필요한 순간에는 망설임 없이 활시위를 당깁니다. 🏹';
const BACKGROUND_TRANSITION_DURATION = 300;
const mockWithTiming = jest.fn((color: string, _config?: unknown) => color);
const mockUseJobOptionsQuery = jest.fn((_gender?: unknown) => ({ data: [] }));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  return {
    ...Reanimated,
    withTiming: (color: string, config?: unknown) =>
      mockWithTiming(color, config),
  };
});

jest.mock('@/hooks/useAuth', () => ({
  useJobOptionsQuery: (gender?: unknown) => mockUseJobOptionsQuery(gender),
}));

const renderHallOfHeroes = () => render(<HallOfHeroesPage />);

describe('이루라 길드 페이지', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockUseJobOptionsQuery.mockClear();
  });

  it('API 호출 없이 윤에 로컬 여자 검사 이미지를 표시한다', () => {
    const { getByTestId, getByText } = renderHallOfHeroes();
    const character = getByTestId('hall-of-heroes-character');

    expect(mockUseJobOptionsQuery).not.toHaveBeenCalled();
    expect(getByText('윤')).toBeOnTheScreen();
    expect(character.props.source).toBeDefined();
    expect(character.props.source).not.toEqual(
      expect.objectContaining({ uri: expect.any(String) }),
    );
  });

  it('시안과 같이 카드에는 캐릭터·직업명·설명만 표시하고 화살표는 카드 밖에 둔다', async () => {
    const { getByLabelText, getByTestId, getByText, queryByText } =
      await renderHallOfHeroes();
    const card = getByTestId('hall-of-heroes-card');
    const description = getByText(WARRIOR_DESCRIPTION);

    expect(getByText('이루라 길드')).toBeOnTheScreen();
    expect(getByText('윤')).toBeOnTheScreen();
    expect(description).toBeOnTheScreen();
    expect(getByTestId('hall-of-heroes-character')).toBeOnTheScreen();
    expect(queryByText('suld2495')).toBeNull();
    expect(queryByText('세계를 세운 선봉장')).toBeNull();
    expect(queryByText('전설의 영웅')).toBeNull();
    expect(queryByText('전설에 이름을 남긴 이들')).toBeNull();
    expect(within(card).queryByLabelText('이전 영웅')).toBeNull();
    expect(within(card).queryByLabelText('다음 영웅')).toBeNull();
    expect(getByLabelText('이전 영웅')).toBeOnTheScreen();
    expect(getByLabelText('다음 영웅')).toBeOnTheScreen();
    expect(StyleSheet.flatten(description.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.gray[15] }),
    );
    expect(
      StyleSheet.flatten(getByTestId('hall-of-heroes-screen').props.style),
    ).toEqual(
      expect.objectContaining({ backgroundColor: palette.theme.blue[10] }),
    );

    fireEvent.press(getByLabelText('뒤로가기'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('카드 바깥 화살표로 직업과 배경을 순서대로 전환한다', async () => {
    const { getByLabelText, getByTestId, getByText } =
      await renderHallOfHeroes();

    expect(
      getByTestId('hall-of-heroes-dot-0').props.accessibilityState,
    ).toEqual({ selected: true });

    fireEvent.press(getByLabelText('다음 영웅'));

    expect(getByText('연')).toBeOnTheScreen();
    expect(
      getByTestId('hall-of-heroes-dot-1').props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      StyleSheet.flatten(getByTestId('hall-of-heroes-screen').props.style),
    ).toEqual(
      expect.objectContaining({ backgroundColor: palette.theme.red[10] }),
    );

    fireEvent.press(getByLabelText('다음 영웅'));

    expect(getByText('문')).toBeOnTheScreen();
    expect(getByText(ARCHER_DESCRIPTION)).toBeOnTheScreen();
    expect(
      getByTestId('hall-of-heroes-dot-2').props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      StyleSheet.flatten(getByTestId('hall-of-heroes-screen').props.style),
    ).toEqual(
      expect.objectContaining({ backgroundColor: palette.theme.green[10] }),
    );

    fireEvent.press(getByLabelText('다음 영웅'));

    expect(getByText('윤')).toBeOnTheScreen();
  });

  it('직업을 변경하면 페이지와 카드 배경색을 부드럽게 전환한다', async () => {
    const { getByLabelText } = await renderHallOfHeroes();

    mockWithTiming.mockClear();
    fireEvent.press(getByLabelText('다음 영웅'));

    expect(mockWithTiming).toHaveBeenCalledWith(palette.theme.red[10], {
      duration: BACKGROUND_TRANSITION_DURATION,
    });
    expect(mockWithTiming).toHaveBeenCalledWith(palette.theme.red[5], {
      duration: BACKGROUND_TRANSITION_DURATION,
    });
  });

  it('영웅들에게 에일을 대접하는 하단 버튼을 숨긴다', async () => {
    const { getByTestId, queryByRole } = await renderHallOfHeroes();
    const scrollView = getByTestId('hall-of-heroes-scroll-view');
    const supportAction = getByTestId('hall-of-heroes-support-action', {
      includeHiddenElements: true,
    });

    expect(
      queryByRole('button', {
        name: '영웅들에게 에일 한 잔 대접하기',
      }),
    ).toBeNull();
    expect(StyleSheet.flatten(supportAction.props.style)).toEqual(
      expect.objectContaining({ display: 'none' }),
    );
    expect(
      within(scrollView).queryByText('영웅들에게 에일 한 잔 대접하기'),
    ).toBeNull();
  });

  it('숨긴 에일 대접 버튼의 구현과 목재 스타인 아이콘을 유지한다', async () => {
    const { getByTestId } = await renderHallOfHeroes();
    const supportButton = getByTestId('hall-of-heroes-support-button', {
      includeHiddenElements: true,
    });
    const iconBadge = within(supportButton).getByTestId(
      'hall-of-heroes-wooden-ale-icon-badge',
      { includeHiddenElements: true },
    );
    const icon = within(supportButton).getByTestId(
      'hall-of-heroes-wooden-ale-icon',
      { includeHiddenElements: true },
    );
    const label = within(supportButton).getByText(
      '영웅들에게 에일 한 잔 대접하기',
      { includeHiddenElements: true },
    );

    expect(StyleSheet.flatten(iconBadge.props.style)).toEqual(
      expect.objectContaining({
        width: baseFoundation.dimension.x36,
        height: baseFoundation.dimension.x36,
        backgroundColor: palette.yellow[100],
      }),
    );
    expect(StyleSheet.flatten(icon.props.style)).toEqual(
      expect.objectContaining({
        width: baseFoundation.iconSize.xl,
        height: baseFoundation.iconSize.xl,
      }),
    );
    expect(StyleSheet.flatten(label.props.style)).toEqual(
      expect.objectContaining({
        fontSize: baseFoundation.typography.size.l,
      }),
    );
  });
});
