import RoutineCompleteConfirmModal from '../../../components/modal/routine-complete-confirm-modal';
import {
  fireEvent,
  render,
} from '../../setup/auth-test-utils';

describe('RoutineCompleteConfirmModal', () => {
  it('사진 인증 체크박스를 표시하지 않고 일반 완료를 확인한다', () => {
    const onConfirm = jest.fn();

    const { getByText, getByTestId, queryByText } = render(
      <RoutineCompleteConfirmModal
        onCancel={jest.fn()}
        onConfirm={onConfirm}
        routineName="Test"
        visible
      />,
    );

    expect(getByTestId('routine-complete-confirm-modal')).toBeOnTheScreen();
    expect(queryByText('사진 인증하기')).toBeNull();

    fireEvent.press(getByText('예'));

    expect(onConfirm).toHaveBeenCalledWith(false);
  });
});
