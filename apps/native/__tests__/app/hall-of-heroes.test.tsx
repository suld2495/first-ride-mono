import { fireEvent, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import HallOfHeroesPage from '@/app/hall-of-heroes';
import { baseFoundation, palette } from '@/theme/tokens';

import { render } from '../setup/test-utils';

declare const mockBack: jest.Mock;

const WARRIOR_DESCRIPTION =
  '전사는 목표를 정하고 꾸준히 실천하는 사람에게 어울리는 캐릭터예요. 루틴을 반복해 꾸준함이 쌓일수록 더 강한 모습으로 성장해요.';
const BACKGROUND_TRANSITION_DURATION = 300;
const mockWithTiming = jest.fn((color: string, _config?: unknown) => color);

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  return {
    ...Reanimated,
    withTiming: (color: string, config?: unknown) =>
      mockWithTiming(color, config),
  };
});

describe('영웅의 전당 페이지', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('시안과 같이 카드에는 캐릭터·직업명·설명만 표시하고 화살표는 카드 밖에 둔다', () => {
    const { getByLabelText, getByTestId, getByText, queryByText } = render(
      <HallOfHeroesPage />,
    );
    const card = getByTestId('hall-of-heroes-card');
    const description = getByText(WARRIOR_DESCRIPTION);

    expect(getByText('영웅의 전당')).toBeOnTheScreen();
    expect(getByText('전사')).toBeOnTheScreen();
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

  it('카드 바깥 화살표로 직업과 배경을 순서대로 전환한다', () => {
    const { getByLabelText, getByTestId, getByText } = render(
      <HallOfHeroesPage />,
    );

    expect(
      getByTestId('hall-of-heroes-dot-0').props.accessibilityState,
    ).toEqual({ selected: true });

    fireEvent.press(getByLabelText('다음 영웅'));

    expect(getByText('마법사')).toBeOnTheScreen();
    expect(
      getByTestId('hall-of-heroes-dot-1').props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      StyleSheet.flatten(getByTestId('hall-of-heroes-screen').props.style),
    ).toEqual(
      expect.objectContaining({ backgroundColor: palette.theme.red[10] }),
    );

    fireEvent.press(getByLabelText('다음 영웅'));

    expect(getByText('궁수')).toBeOnTheScreen();
    expect(
      getByTestId('hall-of-heroes-dot-2').props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      StyleSheet.flatten(getByTestId('hall-of-heroes-screen').props.style),
    ).toEqual(
      expect.objectContaining({ backgroundColor: palette.theme.green[10] }),
    );

    fireEvent.press(getByLabelText('다음 영웅'));

    expect(getByText('전사')).toBeOnTheScreen();
  });

  it('직업을 변경하면 페이지와 카드 배경색을 부드럽게 전환한다', () => {
    const { getByLabelText } = render(<HallOfHeroesPage />);

    mockWithTiming.mockClear();
    fireEvent.press(getByLabelText('다음 영웅'));

    expect(mockWithTiming).toHaveBeenCalledWith(palette.theme.red[10], {
      duration: BACKGROUND_TRANSITION_DURATION,
    });
    expect(mockWithTiming).toHaveBeenCalledWith(palette.theme.red[5], {
      duration: BACKGROUND_TRANSITION_DURATION,
    });
  });

  it('영웅들에게 에일을 대접하는 버튼을 화면 하단에 표시한다', () => {
    const { getByRole, getByTestId } = render(<HallOfHeroesPage />);
    const scrollView = getByTestId('hall-of-heroes-scroll-view');
    const supportButton = getByRole('button', {
      name: '영웅들에게 에일 한 잔 대접하기',
    });

    expect(supportButton).toBeOnTheScreen();
    expect(
      within(scrollView).queryByText('영웅들에게 에일 한 잔 대접하기'),
    ).toBeNull();
  });

  it('에일 대접 버튼에 목재 스타인 아이콘을 표시한다', () => {
    const { getByRole } = render(<HallOfHeroesPage />);
    const supportButton = getByRole('button', {
      name: '영웅들에게 에일 한 잔 대접하기',
    });
    const iconBadge = within(supportButton).getByTestId(
      'hall-of-heroes-wooden-ale-icon-badge',
    );
    const icon = within(supportButton).getByTestId(
      'hall-of-heroes-wooden-ale-icon',
    );
    const label =
      within(supportButton).getByText('영웅들에게 에일 한 잔 대접하기');

    expect(icon).toBeOnTheScreen();
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
