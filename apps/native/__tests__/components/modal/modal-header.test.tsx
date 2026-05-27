import { StyleSheet, View } from 'react-native';

import ModalHeader from '@/components/modal/modal-header';
import ModalHeaderActionProvider from '@/components/modal/modal-header-action-provider';
import { baseFoundation } from '@/theme/tokens';

import { fireEvent, render } from '../../setup/test-utils';

const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: mockBack,
    canGoBack: () => true,
    replace: mockReplace,
  },
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
  }),
}));

describe('ModalHeader', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it('타이틀을 좌우 컨텐츠와 무관하게 전체 너비 가운데에 둔다', () => {
    const { getByText } = render(
      <ModalHeaderActionProvider>
        <ModalHeader title="한마디" />
      </ModalHeaderActionProvider>,
    );

    const titleStyle = StyleSheet.flatten(getByText('한마디').props.style);

    expect(titleStyle).toEqual(
      expect.objectContaining({
        left: 0,
        position: 'absolute',
        right: 0,
        textAlign: 'center',
      }),
    );
  });

  it('공통 헤더 높이와 뒤로가기 액션을 사용한다', () => {
    const screen = render(
      <ModalHeaderActionProvider>
        <ModalHeader title="한마디" />
      </ModalHeaderActionProvider>,
    );

    const commonHeaderViews = screen
      .UNSAFE_getAllByType(View)
      .filter(
        (node) =>
          StyleSheet.flatten(node.props.style)?.height ===
          baseFoundation.dimension.x44,
      );

    expect(commonHeaderViews).toHaveLength(1);

    fireEvent.press(screen.getByLabelText('뒤로가기'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
