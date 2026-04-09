import { render, waitFor } from '@testing-library/react-native';

const mockHideAsync = jest.fn();
const mockUseAuthIsLoading = jest.fn();

jest.mock('expo-router', () => ({
  SplashScreen: {
    hideAsync: (...args: unknown[]) => mockHideAsync(...args),
  },
}));

jest.mock('@/hooks/useAuthSession', () => ({
  useAuthIsLoading: () => mockUseAuthIsLoading(),
}));

import SplashScreenController from '@/components/splash';

describe('SplashScreenController', () => {
  beforeEach(() => {
    mockHideAsync.mockClear();
    mockUseAuthIsLoading.mockReset();
  });

  it('인증 상태를 복구하는 동안에는 splash를 유지한다', () => {
    mockUseAuthIsLoading.mockReturnValue(true);

    render(<SplashScreenController />);

    expect(mockHideAsync).not.toHaveBeenCalled();
  });

  it('인증 상태 복구가 끝나면 splash를 숨긴다', async () => {
    mockUseAuthIsLoading.mockReturnValue(false);

    render(<SplashScreenController />);

    await waitFor(() => {
      expect(mockHideAsync).toHaveBeenCalledTimes(1);
    });
  });
});
