import { render } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';

import QuestList from '@/components/quest/quest-list';
import { FlashList } from '@/components/ui/flash-list';
import { useColorSchemeStore } from '@/store/color-scheme.store';
import { appThemes } from '@/theme/themes';

import { createMockQuest, createMockQuests } from '../../setup/quest/mock';

describe('QuestList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-27T00:00:00.000Z'));
  });

  afterEach(() => {
    useColorSchemeStore.getState().setColorScheme('blue');
    useColorSchemeStore.getState().clearColorSchemeOverride();
    jest.useRealTimers();
  });

  it('renders each quest item with a two-layer themed frame', () => {
    const screen = render(
      <QuestList quests={[createMockQuest()]} onClickItem={jest.fn()} />,
    );

    const views = screen.UNSAFE_getAllByType(View);
    const outerFrame = views.find((node) => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.borderRadius === 14 && style?.borderWidth === 2;
    });
    const innerFrame = views.find((node) => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.borderRadius === 12 && style?.borderWidth === 3;
    });

    expect(StyleSheet.flatten(outerFrame?.props.style)).toMatchObject({
      borderColor: appThemes.blue.colors.brand.text,
      borderRadius: 14,
      borderWidth: 2,
      backgroundColor: '#FFFFFF',
      padding: 2,
    });
    const innerFrameStyle = StyleSheet.flatten(innerFrame?.props.style);

    expect(innerFrameStyle).toMatchObject({
      borderColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 3,
      backgroundColor: appThemes.blue.colors.brand.text,
      padding: 17,
    });
    expect(innerFrameStyle.justifyContent).toBeUndefined();
  });

  it('does not add vertical padding and keeps an 8px gap between quest items', () => {
    const screen = render(
      <QuestList quests={createMockQuests(2)} onClickItem={jest.fn()} />,
    );
    const list = screen.UNSAFE_getByType(FlashList);
    const contentStyle = StyleSheet.flatten(list.props.contentContainerStyle);
    const separator = list.props.ItemSeparatorComponent();
    const separatorStyle = StyleSheet.flatten(separator.props.style);

    expect(contentStyle).toMatchObject({
      flexGrow: 1,
    });
    expect(contentStyle.paddingTop).toBeUndefined();
    expect(contentStyle.paddingBottom).toBeUndefined();
    expect(contentStyle.gap).toBeUndefined();
    expect(separatorStyle).toMatchObject({
      height: 8,
    });
  });

  it('renders quest content as an icon, title, progress, and remaining days', () => {
    const quest = createMockQuest(0, {
      description: '기존 설명은 숨겨져야 합니다.',
      endDate: '2026-06-03T00:00:00.000Z',
      successCount: 2,
      verificationTargetCount: 7,
    });

    const screen = render(
      <QuestList quests={[quest]} onClickItem={jest.fn()} />,
    );
    const iconBoxStyle = StyleSheet.flatten(
      screen.getByTestId('quest-icon-placeholder').props.style,
    );
    const progressFillStyle = StyleSheet.flatten(
      screen.getByTestId('quest-progress-fill').props.style,
    );
    const progressTrackStyle = StyleSheet.flatten(
      screen.getByTestId('quest-progress-track').props.style,
    );
    const contentRowStyle = StyleSheet.flatten(
      screen.getByTestId('quest-card-content').props.style,
    );
    const contentColumnStyle = StyleSheet.flatten(
      screen.getByTestId('quest-content-column').props.style,
    );
    const contentColumnChildren = screen.getByTestId('quest-content-column')
      .props.children as Array<{ props: { testID?: string } }>;
    const progressRowStyle = StyleSheet.flatten(
      screen.getByTestId('quest-progress-row').props.style,
    );
    const titleStyle = StyleSheet.flatten(
      screen.getByText('테스트 퀘스트 1').props.style,
    );
    const remainingText = screen.getByText('7일 남음');
    const remainingStyle = StyleSheet.flatten(remainingText.props.style);
    const progressValue = screen.getByText('2/7');
    const progressValueStyle = StyleSheet.flatten(progressValue.props.style);

    expect(screen.getByText('7일 남음')).toBeOnTheScreen();
    expect(screen.getByText('테스트 퀘스트 1')).toBeOnTheScreen();
    expect(screen.getByText('2/7')).toBeOnTheScreen();
    expect(screen.queryByText('일일 퀘스트')).not.toBeOnTheScreen();
    expect(
      screen.queryByText('기존 설명은 숨겨져야 합니다.'),
    ).not.toBeOnTheScreen();
    expect(iconBoxStyle).toMatchObject({
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      height: 40,
      justifyContent: 'center',
      width: 40,
    });
    expect(screen.getByTestId('quest-pixel-star')).toHaveStyle({
      width: 28,
      height: 28,
    });
    expect(contentRowStyle).toMatchObject({
      alignItems: 'flex-start',
      gap: 12,
    });
    expect(contentColumnStyle).toMatchObject({
      gap: 8,
    });
    expect(contentColumnChildren.map((child) => child.props.testID)).toEqual([
      'quest-title',
      'quest-progress-row',
      'quest-remaining-days',
    ]);
    expect(remainingText.props.fontSize).toBe('$caption3');
    expect(remainingText.props.fontWeight).toBe('600');
    expect(remainingStyle).toMatchObject({
      color: appThemes.blue.colors.text.secondary,
    });
    expect(screen.getByText('테스트 퀘스트 1').props.fontSize).toBe('$body2');
    expect(screen.getByText('테스트 퀘스트 1').props.fontWeight).toBe('600');
    expect(titleStyle).toMatchObject({
      color: '#FFFFFF',
      lineHeight: 19.5,
    });
    expect(progressTrackStyle).toMatchObject({
      backgroundColor: appThemes.blue.colors.text.muted,
      borderRadius: 999,
      height: 8,
    });
    expect(progressRowStyle).toMatchObject({
      gap: 8,
    });
    expect(progressFillStyle).toMatchObject({
      backgroundColor: appThemes.blue.colors.brand.primary,
      borderRadius: 999,
      width: `${(2 / 7) * 100}%`,
    });
    expect(progressValue.props.fontSize).toBe('$caption2');
    expect(progressValue.props.fontWeight).toBe('600');
    expect(progressValueStyle).toMatchObject({
      color: appThemes.blue.colors.brand.background,
    });
  });

  it.each(['blue', 'red', 'green'] as const)(
    '%s 테마에서는 별 아이콘 색상을 해당 테마 컬러로 표시한다',
    (themeName) => {
      useColorSchemeStore.getState().setColorScheme(themeName);

      const screen = render(
        <QuestList quests={[createMockQuest()]} onClickItem={jest.fn()} />,
      );
      const fillPixelStyle = StyleSheet.flatten(
        screen.getAllByTestId('quest-pixel-star-F')[0]?.props.style,
      );
      const highlightPixelStyle = StyleSheet.flatten(
        screen.getAllByTestId('quest-pixel-star-H')[0]?.props.style,
      );
      const shadowPixelStyle = StyleSheet.flatten(
        screen.getAllByTestId('quest-pixel-star-S')[0]?.props.style,
      );

      expect(fillPixelStyle).toMatchObject({
        backgroundColor: appThemes[themeName].colors.brand.primary,
      });
      expect(highlightPixelStyle).toMatchObject({
        backgroundColor: appThemes[themeName].colors.brand.secondary,
      });
      expect(shadowPixelStyle).toMatchObject({
        backgroundColor: appThemes[themeName].colors.brand.text,
      });
    },
  );

  it('uses successCount as the current progress count', () => {
    const quest = createMockQuest(0, {
      successCount: 2,
      verificationTargetCount: 7,
    });

    const screen = render(
      <QuestList quests={[quest]} onClickItem={jest.fn()} />,
    );

    expect(screen.getByText('2/7')).toBeOnTheScreen();
  });

  it('uses 1 as the minimum progress target count', () => {
    const emptyTargetQuest = createMockQuest(0, {
      successCount: 0,
    });
    const zeroTargetQuest = createMockQuest(1, {
      successCount: 0,
      verificationTargetCount: 0,
    });

    delete (emptyTargetQuest as Partial<typeof emptyTargetQuest>)
      .verificationTargetCount;

    const screen = render(
      <QuestList
        quests={[emptyTargetQuest, zeroTargetQuest]}
        onClickItem={jest.fn()}
      />,
    );

    expect(screen.getAllByText('0/1')).toHaveLength(2);
    expect(screen.queryByText('0/0')).not.toBeOnTheScreen();
    expect(screen.queryByText('0/')).not.toBeOnTheScreen();
  });
});
