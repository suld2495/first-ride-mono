import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useWhatsNewModal } from '@/hooks/useWhatsNewModal';

const mockedStorage = jest.mocked(AsyncStorage);

describe('useWhatsNewModal', () => {
  beforeEach(() => {
    mockedStorage.getItem.mockReset();
    mockedStorage.setItem.mockReset();
  });

  it('API 빌드 번호가 없으면 저장소를 조회하지 않고 공지를 숨긴다', () => {
    const { result } = renderHook(() => useWhatsNewModal(null));

    expect(result.current.isVisible).toBe(false);
    expect(mockedStorage.getItem).not.toHaveBeenCalled();

    act(() => result.current.dismiss());

    expect(mockedStorage.setItem).not.toHaveBeenCalled();
  });

  it('로컬 저장소를 읽을 수 없으면 공지를 숨긴다', async () => {
    mockedStorage.getItem.mockRejectedValue(new Error('storage unavailable'));

    const { result } = renderHook(() => useWhatsNewModal(43));

    await waitFor(() => {
      expect(mockedStorage.getItem).toHaveBeenCalledWith(
        'whats-new-dismissed-build:43',
      );
    });
    expect(result.current.isVisible).toBe(false);
  });

  it('닫힘 상태 저장에 실패해도 현재 공지는 닫는다', async () => {
    mockedStorage.getItem.mockResolvedValue(null);
    mockedStorage.setItem.mockRejectedValue(new Error('storage unavailable'));

    const { result } = renderHook(() => useWhatsNewModal(43));

    await waitFor(() => {
      expect(result.current.isVisible).toBe(true);
    });

    act(() => result.current.dismiss());

    expect(result.current.isVisible).toBe(false);
    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      'whats-new-dismissed-build:43',
      'true',
    );
  });
});
