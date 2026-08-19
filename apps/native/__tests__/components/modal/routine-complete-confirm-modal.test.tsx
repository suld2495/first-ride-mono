import { Modal } from 'react-native';

import RoutineCompleteConfirmModal from '../../../components/modal/routine-complete-confirm-modal';
import { fireEvent, render } from '../../setup/auth-test-utils';

describe('RoutineCompleteConfirmModal', () => {
  it('사진 인증 체크박스를 표시하지 않고 일반 완료를 확인한다', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    const { getByText, getByTestId, queryByText, UNSAFE_getByType } = render(
      <RoutineCompleteConfirmModal
        onCancel={onCancel}
        onConfirm={onConfirm}
        visible
      />,
    );

    expect(getByTestId('routine-complete-confirm-modal')).toBeOnTheScreen();
    expect(queryByText('사진 인증하기')).toBeNull();
    expect(queryByText('Test')).toBeNull();

    fireEvent(UNSAFE_getByType(Modal), 'requestClose');
    fireEvent.press(getByText('예'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('제출 중에는 취소와 확인을 처리하지 않는다', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    const { getByText, UNSAFE_getByType } = render(
      <RoutineCompleteConfirmModal
        isSubmitting
        onCancel={onCancel}
        onConfirm={onConfirm}
        visible
      />,
    );

    fireEvent.press(getByText('아니요'));
    fireEvent(UNSAFE_getByType(Modal), 'requestClose');
    fireEvent.press(getByText('예'));

    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
