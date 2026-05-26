import { StyleSheet } from 'react-native';

import ModalHeader from '@/components/modal/modal-header';
import ModalHeaderActionProvider from '@/components/modal/modal-header-action-provider';

import { render } from '../../setup/test-utils';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    canGoBack: () => true,
    replace: jest.fn(),
  },
}));

describe('ModalHeader', () => {
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
});
