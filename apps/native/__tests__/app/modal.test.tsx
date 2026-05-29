import { StyleSheet } from 'react-native';

import ModalScreen from '../../app/modal';
import { render } from '../setup/test-utils';

declare const mockSearchParams: Record<string, string | undefined>;
declare const mockRoutineStore: {
  setRoutineId: jest.Mock;
};

let mockModalOptions: Record<string, unknown> = {};

jest.mock('@/components/modal/modal-header', () => {
  const { Text } = require('react-native');

  function ModalHeaderMock({ title }: { title: string }) {
    return <Text>{title}</Text>;
  }

  return ModalHeaderMock;
});

jest.mock('@/hooks/useModal', () => ({
  useModal: () => ['테스트 모달', () => null, mockModalOptions],
}));

describe('ModalScreen', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockSearchParams)) {
      delete mockSearchParams[key];
    }
    mockSearchParams.type = 'routine-add';
    mockModalOptions = {};
    mockRoutineStore.setRoutineId.mockClear();
  });

  it('does not add extra top padding above the shared page header', () => {
    const { getByTestId } = render(<ModalScreen />);

    const containerStyle = StyleSheet.flatten(
      getByTestId('modal-screen-container').props.style,
    );

    expect(containerStyle).toEqual(
      expect.objectContaining({
        flex: 1,
      }),
    );
    expect(containerStyle.paddingTop).toBeUndefined();
  });

  it('keeps the gap between the modal header and body at 0px', () => {
    const { getByTestId } = render(<ModalScreen />);

    const contentStyle = StyleSheet.flatten(
      getByTestId('modal-screen-content').props.style,
    );

    expect(contentStyle.marginTop).toBe(0);
    expect(contentStyle.paddingTop).toBe(0);
  });

  it('uses 24px as the default horizontal content padding', () => {
    const { getByTestId } = render(<ModalScreen />);

    const contentStyle = StyleSheet.flatten(
      getByTestId('modal-screen-content').props.style,
    );

    expect(contentStyle.paddingHorizontal).toBe(24);
  });

  it('allows the horizontal content padding to be configured by modal options', () => {
    mockModalOptions = {
      contentPaddingHorizontal: 20,
    };

    const { getByTestId } = render(<ModalScreen />);

    const contentStyle = StyleSheet.flatten(
      getByTestId('modal-screen-content').props.style,
    );

    expect(contentStyle.paddingHorizontal).toBe(20);
  });

  it('stores routineId from shared certification request links', () => {
    mockSearchParams.type = 'request';
    mockSearchParams.routineId = '42';

    render(<ModalScreen />);

    expect(mockRoutineStore.setRoutineId).toHaveBeenCalledWith(42);
  });
});
