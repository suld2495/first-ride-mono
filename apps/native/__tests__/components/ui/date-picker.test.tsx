import { StyleSheet } from 'react-native';

import DatePicker from '@/components/ui/date-picker';
import { getEffectiveColorSchemeSnapshot } from '@/hooks/useEffectiveColorScheme';
import { appThemes } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';

import { fireEvent, render, within } from '../../setup/test-utils';

const renderDatePicker = () =>
  render(
    <DatePicker
      value={null}
      buttonTitle="시작일 선택"
      sheetLabel="시작일 선택"
      defaultDate={new Date(2026, 6, 27)}
      onConfirmDate={jest.fn()}
    />,
  );

describe('DatePicker', () => {
  it('넓은 화면에서도 바텀 시트의 최대 너비와 화면 기준 최대 높이를 제한한다', () => {
    const screen = renderDatePicker();

    fireEvent.press(screen.getByText('시작일 선택'));

    expect(
      StyleSheet.flatten(
        screen.getByTestId('bottom-sheet-container').props.style,
      ),
    ).toEqual(
      expect.objectContaining({
        width: '100%',
        maxWidth: 520,
        maxHeight: '88%',
        alignSelf: 'center',
      }),
    );
  });

  it('바텀 시트를 Header, Body, Footer로 나누고 날짜 그리드만 Body에 둔다', () => {
    const screen = renderDatePicker();

    fireEvent.press(screen.getByText('시작일 선택'));

    const header = screen.getByTestId('bottom-sheet-header');
    const body = screen.getByTestId('bottom-sheet-body');
    const footer = screen.getByTestId('bottom-sheet-footer');

    expect(within(header).getByLabelText('년월 선택 열기')).toBeOnTheScreen();
    expect(
      within(body).getByLabelText('2026-07-27 선택 가능'),
    ).toBeOnTheScreen();
    expect(within(footer).getByText('확인')).toBeOnTheScreen();
    expect(within(body).queryByText('확인')).not.toBeOnTheScreen();
  });

  it('연월 선택 상태에서도 적용 액션을 Footer에 고정한다', () => {
    const screen = renderDatePicker();

    fireEvent.press(screen.getByText('시작일 선택'));
    fireEvent.press(screen.getByLabelText('년월 선택 열기'));

    const body = screen.getByTestId('bottom-sheet-body');
    const footer = screen.getByTestId('bottom-sheet-footer');

    expect(within(body).getByText('7월')).toBeOnTheScreen();
    expect(within(footer).getByText('적용')).toBeOnTheScreen();
    expect(within(body).queryByText('적용')).not.toBeOnTheScreen();
  });

  it('Footer 상단을 구분선으로 Body와 구분한다', () => {
    const screen = renderDatePicker();
    const themeName = getEffectiveColorSchemeSnapshot();

    fireEvent.press(screen.getByText('시작일 선택'));

    expect(
      StyleSheet.flatten(screen.getByTestId('bottom-sheet-footer').props.style),
    ).toEqual(
      expect.objectContaining({
        borderTopWidth: baseFoundation.dimension.x1,
        borderTopColor: appThemes[themeName].colors.border.divider,
        paddingTop: baseFoundation.spacing[4],
      }),
    );
  });
});
