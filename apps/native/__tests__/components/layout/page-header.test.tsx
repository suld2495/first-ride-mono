import { StyleSheet, View } from 'react-native';

import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { baseFoundation, palette } from '@/theme/tokens';

import { fireEvent, render } from '../../setup/test-utils';

declare const mockBack: jest.Mock;

describe('PageHeader', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('keeps the title centered regardless of side content', () => {
    const { getByText } = render(
      <PageHeader
        title="공통 헤더"
        showBackButton
        right={<Button title="길이가 긴 우측 액션" />}
      />,
    );

    const titleStyle = StyleSheet.flatten(getByText('공통 헤더').props.style);

    expect(titleStyle).toEqual(
      expect.objectContaining({
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
      }),
    );
  });

  it('uses the page header title color token', () => {
    const { getByText } = render(<PageHeader title="공통 헤더" />);

    const titleStyle = StyleSheet.flatten(getByText('공통 헤더').props.style);

    expect(titleStyle).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[90],
      }),
    );
  });

  it('uses the shared fixed header height', () => {
    const screen = render(<PageHeader title="공통 헤더" />);

    const headerViews = screen
      .UNSAFE_getAllByType(View)
      .filter(
        (node) =>
          StyleSheet.flatten(node.props.style)?.height ===
          baseFoundation.dimension.x44,
      );

    expect(headerViews).toHaveLength(1);
  });

  it('shows a back button only when requested and routes back', () => {
    const screen = render(<PageHeader title="기본 헤더" />);

    expect(screen.queryByLabelText('뒤로가기')).not.toBeOnTheScreen();

    screen.rerender(<PageHeader title="뒤로가기 헤더" showBackButton />);

    fireEvent.press(screen.getByLabelText('뒤로가기'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('uses the shared vector back icon with fixed skin gray color', () => {
    const { getByTestId } = render(
      <PageHeader title="뒤로가기 헤더" showBackButton />,
    );

    expect(getByTestId('page-header-back-icon')).toHaveProp('width', 8);
    expect(getByTestId('page-header-back-icon')).toHaveProp('height', 14);
    expect(getByTestId('page-header-back-icon-path')).toHaveProp(
      'd',
      'M7 13L1 7L7 1',
    );
    expect(getByTestId('page-header-back-icon-path').props.stroke).toBeTruthy();
  });

  it('uses the provided back handler before the router fallback', () => {
    const handleBackPress = jest.fn();
    const { getByLabelText } = render(
      <PageHeader
        title="뒤로가기 헤더"
        showBackButton
        onBackPress={handleBackPress}
      />,
    );

    fireEvent.press(getByLabelText('뒤로가기'));

    expect(handleBackPress).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });
});
