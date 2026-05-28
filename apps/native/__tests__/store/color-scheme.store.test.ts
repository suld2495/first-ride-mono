jest.unmock('@/store/color-scheme.store');

import { useColorSchemeStore } from '@/store/color-scheme.store';

describe('color-scheme.store', () => {
  it('기본 테마는 블루다', () => {
    expect(useColorSchemeStore.getState().colorScheme).toBe('blue');
  });
});
