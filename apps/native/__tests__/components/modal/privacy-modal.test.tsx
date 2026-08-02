import { act, fireEvent, waitFor } from '@testing-library/react-native';

import PrivacyModal from '@/components/modal/privacy-modal';
import {
  getClarityAnalyticsEnabled,
  setClarityAnalyticsEnabled,
} from '@/utils/clarity';
import {
  getFirebaseAnalyticsEnabled,
  setFirebaseAnalyticsEnabled,
} from '@/utils/firebase-analytics';

import { render } from '../../setup/test-utils';

declare const mockShowToast: jest.Mock;

jest.mock('@/utils/clarity', () => ({
  getClarityAnalyticsEnabled: jest.fn(),
  setClarityAnalyticsEnabled: jest.fn(),
}));

jest.mock('@/utils/firebase-analytics', () => ({
  getFirebaseAnalyticsEnabled: jest.fn(),
  setFirebaseAnalyticsEnabled: jest.fn(),
}));

describe('개인정보 처리방침', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getClarityAnalyticsEnabled as jest.Mock).mockResolvedValue(true);
    (setClarityAnalyticsEnabled as jest.Mock).mockResolvedValue(undefined);
    (getFirebaseAnalyticsEnabled as jest.Mock).mockResolvedValue(true);
    (setFirebaseAnalyticsEnabled as jest.Mock).mockResolvedValue(undefined);
  });

  it('Clarity와 Firebase 설정을 각각 기본 켜짐으로 표시한다', async () => {
    const { getByLabelText, getByText } = render(<PrivacyModal />);

    expect(getByText('개인정보 처리방침')).toBeOnTheScreen();
    expect(getByText('1. 총칙')).toBeOnTheScreen();
    await waitFor(() => {
      expect(
        getByLabelText('Microsoft Clarity 분석').props.accessibilityState,
      ).toEqual(expect.objectContaining({ checked: true }));
      expect(
        getByLabelText('Firebase Analytics 분석').props.accessibilityState,
      ).toEqual(expect.objectContaining({ checked: true }));
    });
  });

  it('Clarity만 꺼도 Firebase 설정은 변경하지 않는다', async () => {
    const { getByLabelText } = render(<PrivacyModal />);
    const claritySwitch = await waitFor(() =>
      getByLabelText('Microsoft Clarity 분석'),
    );

    await act(async () => {
      fireEvent(claritySwitch, 'valueChange', false);
    });

    await waitFor(() => {
      expect(setClarityAnalyticsEnabled).toHaveBeenCalledWith(false);
      expect(setFirebaseAnalyticsEnabled).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        'Microsoft Clarity 분석을 껐습니다.',
        'success',
      );
    });
  });

  it('Firebase만 꺼도 Clarity 설정은 변경하지 않는다', async () => {
    const { getByLabelText } = render(<PrivacyModal />);
    const firebaseSwitch = await waitFor(() =>
      getByLabelText('Firebase Analytics 분석'),
    );

    await act(async () => {
      fireEvent(firebaseSwitch, 'valueChange', false);
    });

    await waitFor(() => {
      expect(setFirebaseAnalyticsEnabled).toHaveBeenCalledWith(false);
      expect(setClarityAnalyticsEnabled).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        'Firebase Analytics 분석을 껐습니다.',
        'success',
      );
    });
  });

  it('Firebase 설정 변경에 실패하면 저장된 선택을 복원한다', async () => {
    (setFirebaseAnalyticsEnabled as jest.Mock).mockRejectedValue(
      new Error('native sdk unavailable'),
    );
    const { getByLabelText } = render(<PrivacyModal />);
    const firebaseSwitch = await waitFor(() =>
      getByLabelText('Firebase Analytics 분석'),
    );

    await act(async () => {
      fireEvent(firebaseSwitch, 'valueChange', false);
    });

    await waitFor(() => {
      expect(firebaseSwitch.props.accessibilityState.checked).toBe(true);
      expect(mockShowToast).toHaveBeenCalledWith(
        'Firebase Analytics 설정을 변경하지 못했습니다.',
        'error',
      );
    });
  });
});
