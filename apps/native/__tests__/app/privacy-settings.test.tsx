import { act, fireEvent, waitFor } from '@testing-library/react-native';

import PrivacySettingsPage from '@/app/privacy-settings';
import {
  getClarityAnalyticsEnabled,
  setClarityAnalyticsEnabled,
} from '@/utils/clarity';

import { render } from '../setup/test-utils';

declare const mockBack: jest.Mock;
declare const mockShowToast: jest.Mock;

jest.mock('@/utils/clarity', () => ({
  getClarityAnalyticsEnabled: jest.fn(),
  setClarityAnalyticsEnabled: jest.fn(),
}));

describe('개인정보 설정', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getClarityAnalyticsEnabled as jest.Mock).mockResolvedValue(false);
    (setClarityAnalyticsEnabled as jest.Mock).mockResolvedValue(undefined);
  });

  it('신규 설치에서는 사용 데이터 분석이 꺼진 상태로 표시된다', async () => {
    const { getByLabelText, getByText } = render(<PrivacySettingsPage />);

    expect(getByText('개인정보 설정')).toBeOnTheScreen();
    expect(
      await waitFor(() =>
        expect(getByLabelText('사용 데이터 분석').props.accessibilityState)
          .toEqual(expect.objectContaining({ checked: false })),
      ),
    ).toBeUndefined();

    fireEvent.press(getByLabelText('뒤로가기'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('사용자가 동의하면 분석 수집 설정을 저장한다', async () => {
    const { getByLabelText } = render(<PrivacySettingsPage />);
    const analyticsSwitch = await waitFor(() =>
      getByLabelText('사용 데이터 분석'),
    );

    await act(async () => {
      fireEvent(analyticsSwitch, 'valueChange', true);
    });

    await waitFor(() => {
      expect(setClarityAnalyticsEnabled).toHaveBeenCalledWith(true);
      expect(mockShowToast).toHaveBeenCalledWith(
        '사용 데이터 분석을 켰습니다.',
        'success',
      );
    });
  });

  it('설정 변경에 실패하면 이전 선택을 유지하고 오류를 알린다', async () => {
    (setClarityAnalyticsEnabled as jest.Mock).mockRejectedValue(
      new Error('native sdk unavailable'),
    );
    const { getByLabelText } = render(<PrivacySettingsPage />);
    const analyticsSwitch = await waitFor(() =>
      getByLabelText('사용 데이터 분석'),
    );

    await act(async () => {
      fireEvent(analyticsSwitch, 'valueChange', true);
    });

    await waitFor(() => {
      expect(analyticsSwitch.props.accessibilityState.checked).toBe(false);
      expect(mockShowToast).toHaveBeenCalledWith(
        '분석 수집 설정을 변경하지 못했습니다.',
        'error',
      );
    });
  });
});
