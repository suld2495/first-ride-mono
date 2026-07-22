import { act, fireEvent, waitFor } from '@testing-library/react-native';

import PrivacyModal from '@/components/modal/privacy-modal';
import {
  getClarityAnalyticsEnabled,
  setClarityAnalyticsEnabled,
} from '@/utils/clarity';

import { render } from '../../setup/test-utils';

declare const mockShowToast: jest.Mock;

jest.mock('@/utils/clarity', () => ({
  getClarityAnalyticsEnabled: jest.fn(),
  setClarityAnalyticsEnabled: jest.fn(),
}));

describe('개인정보 처리방침', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getClarityAnalyticsEnabled as jest.Mock).mockResolvedValue(false);
    (setClarityAnalyticsEnabled as jest.Mock).mockResolvedValue(undefined);
  });

  it('처리방침과 사용 데이터 분석 설정을 한 화면에 표시한다', async () => {
    const { getAllByText, getByLabelText, getByText } = render(
      <PrivacyModal />,
    );

    expect(getByText('개인정보 처리방침')).toBeOnTheScreen();
    expect(getByText('1. 총칙')).toBeOnTheScreen();
    expect(getAllByText('사용 데이터 분석').length).toBeGreaterThan(0);
    expect(
      await waitFor(() =>
        expect(
          getByLabelText('사용 데이터 분석').props.accessibilityState,
        ).toEqual(expect.objectContaining({ checked: false })),
      ),
    ).toBeUndefined();
  });

  it('사용자가 동의하면 분석 수집 설정을 저장한다', async () => {
    const { getByLabelText } = render(<PrivacyModal />);
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

  it('사용자가 동의를 철회하면 분석 수집 중지 설정을 저장한다', async () => {
    (getClarityAnalyticsEnabled as jest.Mock).mockResolvedValue(true);
    const { getByLabelText } = render(<PrivacyModal />);
    const analyticsSwitch = await waitFor(() =>
      getByLabelText('사용 데이터 분석'),
    );

    await waitFor(() => {
      expect(analyticsSwitch.props.accessibilityState.checked).toBe(true);
    });

    await act(async () => {
      fireEvent(analyticsSwitch, 'valueChange', false);
    });

    await waitFor(() => {
      expect(setClarityAnalyticsEnabled).toHaveBeenCalledWith(false);
      expect(mockShowToast).toHaveBeenCalledWith(
        '사용 데이터 분석을 껐습니다.',
        'success',
      );
    });
  });

  it('설정 변경에 실패하면 저장된 선택을 복원하고 오류를 알린다', async () => {
    (setClarityAnalyticsEnabled as jest.Mock).mockRejectedValue(
      new Error('native sdk unavailable'),
    );
    const { getByLabelText } = render(<PrivacyModal />);
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
