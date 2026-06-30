jest.unmock('@/hooks/useColorScheme');

import { act, render } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { ThemeStyleRefreshBoundary } from '@/components/ui/tamagui-provider';
import { useColorSchemeStore } from '@/store/color-scheme.store';

describe('ThemeStyleRefreshBoundary', () => {
  beforeEach(() => {
    act(() => {
      useColorSchemeStore.getState().setColorScheme('dark');
      useColorSchemeStore.getState().clearColorSchemeOverride();
    });
  });

  it('remounts children when the app theme changes', () => {
    let mountCount = 0;
    let unmountCount = 0;

    const StyleOnlyChild = () => {
      useEffect(() => {
        mountCount += 1;

        return () => {
          unmountCount += 1;
        };
      }, []);

      return <Text testID="style-only-child">style only child</Text>;
    };

    render(
      <ThemeStyleRefreshBoundary>
        <StyleOnlyChild />
      </ThemeStyleRefreshBoundary>,
    );

    expect(mountCount).toBe(1);
    expect(unmountCount).toBe(0);

    act(() => {
      useColorSchemeStore.getState().setColorScheme('light');
    });

    expect(mountCount).toBe(2);
    expect(unmountCount).toBe(1);
  });

  it('does not remount children when only a temporary theme override changes', () => {
    let mountCount = 0;
    let unmountCount = 0;

    const NavigationChild = () => {
      useEffect(() => {
        mountCount += 1;

        return () => {
          unmountCount += 1;
        };
      }, []);

      return <Text testID="navigation-child">navigation child</Text>;
    };

    render(
      <ThemeStyleRefreshBoundary>
        <NavigationChild />
      </ThemeStyleRefreshBoundary>,
    );

    act(() => {
      useColorSchemeStore.getState().setColorSchemeOverride('green');
    });

    expect(mountCount).toBe(1);
    expect(unmountCount).toBe(0);

    act(() => {
      useColorSchemeStore.getState().clearColorSchemeOverride();
    });

    expect(mountCount).toBe(1);
    expect(unmountCount).toBe(0);
  });
});
