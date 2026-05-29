import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import QuestStatusTabs from '@/components/quest/quest-status-tabs';
import { Button } from '@/components/ui/button';
import { useColorSchemeStore } from '@/store/color-scheme.store';
import { palette } from '@/theme/tokens';

describe('QuestStatusTabs', () => {
  beforeEach(() => {
    useColorSchemeStore.getState().setColorScheme('blue');
  });

  it('renders the optional action on the far right of the status filter row', () => {
    const { getByText } = render(
      <QuestStatusTabs
        selected="ALL"
        onSelect={jest.fn()}
        right={<Button title="추가" size="sm" />}
      />,
    );

    expect(getByText('전체')).toBeOnTheScreen();
    expect(getByText('진행전')).toBeOnTheScreen();
    expect(getByText('진행중')).toBeOnTheScreen();
    expect(getByText('추가')).toBeOnTheScreen();
  });

  it('selects upcoming status for the upcoming tab', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <QuestStatusTabs selected="ALL" onSelect={onSelect} />,
    );

    fireEvent.press(getByText('진행전'));

    expect(onSelect).toHaveBeenCalledWith('UPCOMING');
  });

  it('uses the quest filter row and badge style tokens', () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <QuestStatusTabs selected="ALL" onSelect={jest.fn()} />,
    );

    const statusRow = UNSAFE_getAllByType(View).find((node) => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.flexDirection === 'row' && style?.alignItems === 'center';
    });

    expect(StyleSheet.flatten(statusRow?.props.style)).toMatchObject({
      paddingVertical: 4,
    });

    const tabRow = UNSAFE_getAllByType(View).find((node) => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.flexDirection === 'row' && style?.gap === 4;
    });

    expect(StyleSheet.flatten(tabRow?.props.style)).toMatchObject({
      justifyContent: 'flex-start',
      gap: 4,
    });

    const badges = UNSAFE_getAllByType(Pressable).slice(0, 3);
    const [activeBadge, inactiveBadge] = badges;
    const activeStyle = StyleSheet.flatten(
      activeBadge.props.style({ pressed: false }),
    );
    const inactiveStyle = StyleSheet.flatten(
      inactiveBadge.props.style({ pressed: false }),
    );

    expect(activeStyle).toMatchObject({
      height: 32,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: palette.theme.gray[60],
      backgroundColor: palette.white,
      paddingHorizontal: 12,
    });
    expect(activeStyle.flex).toBeUndefined();
    expect(inactiveStyle).toMatchObject({
      height: 32,
      borderRadius: 99,
      backgroundColor: 'transparent',
      borderColor: palette.theme.softBlue[50],
      paddingHorizontal: 12,
    });
    expect(inactiveStyle.flex).toBeUndefined();

    const activeText = getByText('전체');
    const inactiveText = getByText('진행전');

    expect(activeText.props.fontSize).toBe('$body3');
    expect(activeText.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(activeText.props.style)).toMatchObject({
      color: palette.theme.gray[60],
    });
    expect(inactiveText.props.fontSize).toBe('$body3');
    expect(inactiveText.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(inactiveText.props.style)).toMatchObject({
      color: palette.theme.softBlue[50],
    });
  });
});
