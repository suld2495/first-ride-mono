import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Pressable, Text } from 'react-native';

import ToastContainer from '@/components/ui/toast-container';
import { ToastProvider, useToast } from '@/contexts/ToastContext';

jest.unmock('@/contexts/ToastContext');

jest.mock('@/components/ui/typography', () => {
  const ReactModule = require('react') as typeof React;
  const { Text: NativeText } = require('react-native');

  return {
    Typography: ({ children }: { children?: React.ReactNode }) => {
      const [, setStyleRevision] = ReactModule.useState(0);

      ReactModule.useInsertionEffect(() => {
        setStyleRevision(1);
      }, []);

      return <NativeText>{children}</NativeText>;
    },
  };
});

const ShowToastButton = () => {
  const { showToast } = useToast();

  return (
    <Pressable
      testID="show-toast"
      onPress={() => showToast('업로드할 수 없는 이미지입니다.', 'error', 0)}
    >
      <Text>토스트 표시</Text>
    </Pressable>
  );
};

describe('ToastContainer', () => {
  it('동적으로 토스트를 표시할 때 insertion effect에서 갱신하지 않는다', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const screen = render(
      <ToastProvider>
        <ShowToastButton />
        <ToastContainer />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('show-toast'));

    await waitFor(() => {
      expect(
        screen.getByText('업로드할 수 없는 이미지입니다.'),
      ).toBeOnTheScreen();
    });

    const hasInsertionEffectWarning = consoleErrorSpy.mock.calls.some((call) =>
      call.some((argument) =>
        String(argument).includes(
          'useInsertionEffect must not schedule updates',
        ),
      ),
    );

    expect(hasInsertionEffectWarning).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('닫기 버튼을 누르면 표시된 토스트를 제거한다', async () => {
    const screen = render(
      <ToastProvider>
        <ShowToastButton />
        <ToastContainer />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('show-toast'));
    await screen.findByText('업로드할 수 없는 이미지입니다.');

    fireEvent.press(screen.getByLabelText('알림 닫기'));

    await waitFor(() => {
      expect(screen.queryByText('업로드할 수 없는 이미지입니다.')).toBeNull();
    });
  });
});
