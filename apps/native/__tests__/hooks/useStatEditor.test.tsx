import { renderHook } from '@testing-library/react-native';

import { useStatEditor } from '@/hooks/useStatEditor';
import { useStatStore } from '@/store/stat.store';

describe('useStatEditor', () => {
  beforeEach(() => {
    useStatStore.getState().finishEditing();
  });

  it('스토어 selector가 안정적으로 동작한다', () => {
    expect(() => renderHook(() => useStatEditor())).not.toThrow();
  });
});
