import { Modal, Platform, Text } from 'react-native';

import FullscreenModal from '@/components/ui/fullscreen-modal';

import { render } from '../../setup/test-utils';

describe('FullscreenModal', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
  });

  it('Android에서 상태바와 내비게이션바 아래까지 모달을 확장한다', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });

    const screen = render(
      <FullscreenModal visible>
        <Text>내용</Text>
      </FullscreenModal>,
    );
    const modal = screen.UNSAFE_getByType(Modal);

    expect(modal.props.statusBarTranslucent).toBe(true);
    expect(modal.props.navigationBarTranslucent).toBe(true);
  });

  it('iOS에서는 시스템 바 관련 속성을 적용하지 않는다', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    const screen = render(
      <FullscreenModal visible>
        <Text>내용</Text>
      </FullscreenModal>,
    );
    const modal = screen.UNSAFE_getByType(Modal);

    expect(modal.props.statusBarTranslucent).toBeUndefined();
    expect(modal.props.navigationBarTranslucent).toBeUndefined();
  });
});
