import { fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import InquiryPage from '../../app/inquiry';
import NotificationSettingsPage from '../../app/notification-settings';
import RoutineSettingsPage from '../../app/routine-settings';
import { palette } from '../../theme/tokens';
import { render } from '../setup/test-utils';

declare const mockBack: jest.Mock;
declare const mockPush: jest.Mock;

describe('설정 하위 페이지', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockPush.mockClear();
  });

  it.each([
    ['루틴 설정', <RoutineSettingsPage />],
    ['알림 설정', <NotificationSettingsPage />],
    ['문의', <InquiryPage />],
  ])('%s 페이지는 상단 타이틀과 뒤로가기를 표시한다', (title, page) => {
    const { getByLabelText, getByText } = render(page);

    expect(getByText(title)).toBeOnTheScreen();

    fireEvent.press(getByLabelText('뒤로가기'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('루틴 설정 페이지는 헤더 아래 12px 여백과 숨긴 루틴 링크를 표시한다', () => {
    const { getByTestId, getByText } = render(<RoutineSettingsPage />);
    const contentStyle = StyleSheet.flatten(
      getByTestId('routine-settings-content').props.style,
    );
    const menuItemStyle = StyleSheet.flatten(
      getByTestId('routine-settings-hidden-routines-item').props.style,
    );
    const menuText = getByText('숨긴 루틴 모아보기');
    const menuTextStyle = StyleSheet.flatten(menuText.props.style);

    expect(contentStyle).toEqual(
      expect.objectContaining({
        paddingTop: 12,
      }),
    );
    expect(menuItemStyle).toEqual(
      expect.objectContaining({
        height: 44,
      }),
    );
    expect(menuText.props.fontSize).toBe('$body2');
    expect(menuText.props.fontWeight).toBe('600');
    expect(menuTextStyle).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[60],
      }),
    );

    fireEvent.press(getByTestId('routine-settings-hidden-routines-item'));

    expect(mockPush).toHaveBeenCalledWith('/modal?type=hidden-routines');
  });
});
